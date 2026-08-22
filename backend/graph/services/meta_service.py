from graph.client import client
from graph.queries.meta_queries import LIST_ROLES, LIST_LOCATIONS, LIST_INDUSTRIES, LIST_SKILLS

class MetaService:
    @staticmethod
    def list_roles():
        return client.execute_read(LIST_ROLES)

    @staticmethod
    def list_locations():
        return client.execute_read(LIST_LOCATIONS)

    @staticmethod
    def list_industries():
        return client.execute_read(LIST_INDUSTRIES)

    @staticmethod
    def list_skills():
        return client.execute_read(LIST_SKILLS)
