from django.urls import path

from . import views

urlpatterns = [
    path("health", views.health_check, name="health_check"),
    path("developers/<str:dev_id>", views.developer_profile, name="developer_profile"),
    path("developers/<str:dev_id>/skills", views.developer_skills, name="developer_skills"),
    path("jobs", views.job_list_or_matches, name="job_list_or_matches"),
    path("jobs/<str:job_id>", views.job_detail, name="job_detail"),
    path("jobs/<str:job_id>/missing-skills", views.job_missing_skills, name="job_missing_skills"),
    path("jobs/<str:job_id>/similar", views.job_similar, name="job_similar"),
    path("companies", views.company_list, name="company_list"),
    path("companies/<str:company_id>", views.company_detail, name="company_detail"),
    path("companies/<str:company_id>/jobs", views.company_jobs, name="company_jobs"),
    path("skills/<str:skill_id>/resources", views.skill_resources, name="skill_resources"),
    path("skills/<str:skill_id>/related-jobs", views.skill_related_jobs, name="skill_related_jobs"),
    path("career-path", views.career_path, name="career_path"),
    path("search", views.graph_search, name="graph_search"),
    path("neighborhood", views.neighborhood, name="neighborhood"),
    # lookup tables for filter UIs
    path("roles", views.list_roles, name="list_roles"),
    path("locations", views.list_locations, name="list_locations"),
    path("industries", views.list_industries, name="list_industries"),
    path("skills", views.list_skills, name="list_skills"),
]
