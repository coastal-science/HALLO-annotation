FROM python:3.7-stretch
ENV PYTHONUNBUFFERED 1

WORKDIR /backend
COPY requirements.txt requirements.txt
RUN apt-get update
RUN apt-get install -y --no-install-recommends libhdf5-serial-dev
RUN apt-get install -y --no-install-recommends libsndfile1
RUN pip install --upgrade -v pip
RUN pip install -r requirements.txt

USER root
RUN mkdir -p /staticfiles
RUN chmod 755 /staticfiles

RUN groupadd --gid 1111 orca
RUN usermod -aG orca root

COPY . .
