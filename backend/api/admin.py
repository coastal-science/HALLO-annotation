from django.contrib.admin import AdminSite


class MyAdminSite(AdminSite):
    site_header = 'HALLO Admin Portal'
    site_url = "'/annotation'"


admin_site = MyAdminSite(name='HALLO Admin')
