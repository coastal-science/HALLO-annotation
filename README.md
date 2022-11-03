# HALLO annotation tool

[Introduction](#introduction)

[Software Architecture](#software-architecture)

[Local/Dev Instance Setup](#local-instance-installation-guide)

[Deployment in the Cloud](#deployment-in-the-cloud)

[Deleting Local Instance](#deleting-the-local-instance)

---

## Introduction

The HALLO (Humans and ALgorithms Listening for Orcas) annotation tool is a web application for analyzing and annotating audio files, consisting of three main modules: front-end(user interface), back-end(data processing) and database. It is licensed under the [GNU GPLv3 licens](https://www.gnu.org/licenses/) and hence freely available for anyone to use and modify (including for commercial purposes) as long as the same license is kept. The tool was designed to facilitate the inteaction between machine learning developers and expert bioacousticians working to create automated detectors and classifiers for orcas (Orcinus orca). However, we believe it to be flexible enough to be used or modified for many other projects.

The main functions are:

1. Managing raw audio files, segmenting and compressing them in the back-end and generating the corresponding spectrograms.

2. Users can register as two roles, Model developer and Annotator. Model developers can create batches containing audio segments, which can then be assigned to one or more Annotators, or import annotations created by machine and assign them to annotators. Annotators can wrok on the spectrogram of the audio segments, review the corresponding annotations, create new annotations, and listen to the audio.

3. The generated annotations can be exported to csv format for further analysis or use in machine learning development.

---

## Software Architecture

Hallo application tools use a modular design, with two separate applications for the front-end and back-end, communicating data through the Restful API protocol.

The backend is implemented using the Django framework, and [Ketos](https://docs.meridian.cs.dal.ca/ketos/) is installed as the core component for processing audio, providing a set of standard APIs for the frontend to consume.

The front-end is built using the React framework and runs in most modern browsers. A clean and easy-to-use design is used, focusing on synchronizing, filtering and quickly finding data.

![Hallo annotation interface](project_plans/screenshots/hallo.jpg)

---

## Installation

The HALLO annotation tool is composed of two parts: front-end and back-end. The back-end needs to be installed on a server that can read data directly, and the front-end can be installed on any server.

Two methods of installation are described below, one for installing locally (for use in one single computer, for example), and the other is installed on a remote server for multiple users to access and use. Both ways use docker as a carrier to install.

Users can also adapt the code to their needs and deploy it according to their own installation environment.

## Local instance installation guide

---

### Prerequisite

In the example of a local installation, the HALLO annotation tool runs in a few Docker containers and requires `docker` (and `docker compose`) to be pre-installed on the system.

### Steps

1. The **hallo_annoatation** folder needs to be installed in the same directory as the audio files, and the audio files need to be contained in a folder called **audio**.

   Clone this repo and put it in the same folder where the **audio** folder located.

   A typical directory structure is:

   ```
   Example_Project_folder
    ├─ audio
    └─ hallo_annotation
   ```

2. The **docker-compose.yml** file depends on some environment variables. To configure, create an environment file, (eg **.env**).

   ```
   # Database
   POSTGRES_DB=hallodb
   POSTGRES_USER=hallouser
   POSTGRES_PASSWORD=hallopass

   # PGadmin
   PGADMIN_DEFAULT_EMAIL=pgadmin@hallo.dev
   PGADMIN_DEFAULT_PASSWORD=hallopass

   # Django key
   DJANGO_SECRET_KEY=The_django_secret_key
   ```

3. From the **hallo_annotation** folder, run docker command as below. If you are using linux, you might need to add `sudo`.

   ```
   % docker compose up -d
   ```

4. If all goes well, use `docker compose ps` to check the containers' status.

   ```
   % docker compose ps
   NAME                COMMAND                  SERVICE    STATUS    PORTS
   hallo_backend       "bash -c 'python man…"   backend    running   0.0.0.0:8000->8000/tcp
   hallo_frontend      "docker-entrypoint.s…"   frontend   running   0.0.0.0:3000->3000/tcp
   hallo_pgadmin       "/entrypoint.sh"         pgadmin    running   443/tcp, 0.0.0.0:5050->80/tcp
   hallo_postgres_db   "docker-entrypoint.s…"   db         running   0.0.0.0:5432->5432/tcp
   ```

5. Create the **superuser** for backend administration using the Django `manage.py` script.

   ```
   % docker compose run --rm backend python manage.py createsuperuser
   ```
6. The HALLO annotation tool uses Django's Admin panel to manage user permissions. For the first time, you need to log in and create groups and assign permissions for each group. The Django backend is at: http://localhost:8000/admin/, and you can use the superuser account you just created to log in.

   After logging in, create three user groups in the Groups page (**case-sensitive**).

   ```
   1. Admin
   2. Model Developer
   3. Annotator
   ```

   New users will need to be manually added to a group here after they have completed registration. Permission control here only affects the operation permissions of the **admin interface**, and does not affect the permissions when using the HALLO annotation software. After users are added to the appropriate group, they will enter the applicable user interface once logging into the software, and the group is only used here to differentiate user roles.

   **Permissions for different user groups:**

   - Admin: Has permission to manually create users in the admin interface.
     <br />
     <img src="project_plans/screenshots/admin-permissions.png" width=800 alt="Admin user permissions">

     You aslo need to give a admin user permission to log in to the admin screen by setting this user to `is staff`.
     <br />
     <img src="project_plans/screenshots/set-user-staff.png" width=600 alt="Set user to staff">

   - Model Developer and Annotators: Keep the permissions blank as they don't have access to the admin interface.

7. The user interface will be available at: http://localhost:3000/

---

## Deployment in the cloud

The HALLO annotation tool is based on a modular design and can be flexibly deployed on cloud servers.Depending on the specific network topology, multiple deployment options can be implemented. Each service can be deployed on a separate server or a centralized deployment on a single server using a NGINX web server. Below is a brief description of two deployment methods.

### Using a vitrual machine with public IP or domain name.

![Deployment with public IP address](project_plans/screenshots/deploy-vith-public-ip.png)

In this scenario, the application is deployed on a server with a public IP, and users can directly access the address or domain name of this server to use the service.

### Using a virtural machine with ingress controller.

![Deployment with ingress controller](project_plans/screenshots/deploy-vith-ingress-controller.png)

If the service needs to be deployed in a network with an ingress controller, either using a sub-domain or domian subdirectory to access the service, some configurations in the code need to be adjusted.

In the configuration of the front-end service, you need to add the corresponding `homepage` configuration in the `package.json` file.

In the Django settings of the backend service, you need to adjust the corresponding `MEDIA_URL`, `STATIC_URL` and `LOGIN_REDIRECT_URL` configurations.

The basic setup for this deployment is already done in the code base, and a minimal `docker-compose.sfu.yml` file is provided to demonstrate how to run this configuration.

---

## Deleting the local instance

If you need to remove the software completely, or want to reinstall a fresh version, consider the following steps:

1. Stop the docker containers:

   ```
   % docker compose down
   ```

2. List the images that were built and used by HALLO:

   ```
   % docker compose images
   Container          Repository       Tag      Image Id       Size
   hallo_backend      hallo-backend    latest   e0bc0ba39dae   3.4GB
   hallo_frontend     hallo-frontend   latest   978b4924d1bc   1.68GB
   hallo_pgadmin      dpage/pgadmin4   latest   13bb55e0df01   357MB
   hallo_postgres_db  postgres         13       02cd4e60a6f2   353MB
   ```

3. Delete the images using their Image Id:

   ```
   % docker image rm e0bc0ba39dae 978b4924d1bc 13bb55e0df01 02cd4e60a6f2
   ```

4. Delete the database volumes (optional):

   ```
   % docker volume rm hallo_db_data hallo_pgadmin_data
   ```

5. Clean up docker cache and unused files (optional):

   ```
   % docker system prune
   ```
