from graph.client import client
from graph.queries.company_queries import GET_COMPANY_JOBS, LIST_COMPANIES, GET_COMPANY_DETAIL, GET_COMPANY_TECHNOLOGIES

class CompanyService:
    @staticmethod
    def list_companies():
        return client.execute_read(LIST_COMPANIES)

    @staticmethod
    def get_detail(company_id: str):
        result = client.execute_read(GET_COMPANY_DETAIL, {"company_id": company_id})
        return result[0] if result else None

    @staticmethod
    def get_technologies(company_id: str):
        return client.execute_read(GET_COMPANY_TECHNOLOGIES, {"company_id": company_id})

    @staticmethod
    def get_jobs(company_id: str):
        result = client.execute_read(GET_COMPANY_JOBS, {"company_id": company_id})
        return result
