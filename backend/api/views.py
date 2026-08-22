from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from graph.client import client
from graph.exceptions import CognoDBConnectionError
from graph.services.developer_service import DeveloperService
from graph.services.job_service import JobService
from graph.services.company_service import CompanyService
from graph.services.skill_service import SkillService
from graph.services.explorer_service import ExplorerService

from api.responses import SuccessResponse, ErrorResponse
from api.serializers import serialize_neo4j_value, shape_neighborhood
from graph.services.meta_service import MetaService


def _require_query_param(request, param_name):
    value = request.query_params.get(param_name)
    if not value:
        return None, ErrorResponse(
            400,
            f"{param_name} query parameter is required.",
            status.HTTP_400_BAD_REQUEST,
        )
    return value, None


@api_view(["GET"])
def health_check(request):
    """Health check endpoint to verify API and database connectivity."""
    try:
        client.ping()
        return Response(
            {
                "status": "healthy",
                "database": "CognoDB",
            },
            status=status.HTTP_200_OK,
        )
    except CognoDBConnectionError:
        return Response(
            {
                "status": "unhealthy",
                "database": "CognoDB",
                "error": "Database service unavailable",
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


@api_view(["GET"])
def developer_profile(request, dev_id):
    data = DeveloperService.get_profile(dev_id)
    return SuccessResponse(serialize_neo4j_value(data))


@api_view(["GET"])
def developer_skills(request, dev_id):
    data = DeveloperService.get_skills(dev_id)
    return SuccessResponse(serialize_neo4j_value(data))


@api_view(["GET"])
def job_list_or_matches(request):
    # If dev_id is present, return ranked matches; otherwise return plain list.
    # Filter params (all optional): search, role, location, remote, level, skill, industry
    dev_id = request.query_params.get("dev_id")
    if dev_id:
        data = JobService.get_matches(dev_id)
    else:
        data = JobService.list_jobs()
    data = serialize_neo4j_value(data)
    # Server-side filters applied to the serialized list
    search = (request.query_params.get("search") or "").strip().lower()
    role = (request.query_params.get("role") or "").strip()
    location = (request.query_params.get("location") or "").strip()
    remote = request.query_params.get("remote")  # "true" | "false"
    level = (request.query_params.get("level") or "").strip()
    skill = (request.query_params.get("skill") or "").strip()
    industry = (request.query_params.get("industry") or "").strip()

    # Lazy resolve industry->company map only when needed
    industry_company_ids = None
    if industry:
        try:
            from graph.client import client as _c
            rows = _c.execute_read(
                "MATCH (c:Company)-[:IN_INDUSTRY]->(i:Industry {name: $name}) RETURN c.id AS id",
                {"name": industry},
            )
            industry_company_ids = {r["id"] for r in rows}
        except Exception:
            industry_company_ids = set()

    skill_job_ids = None
    if skill:
        try:
            from graph.client import client as _c2
            rows = _c2.execute_read(
                "MATCH (j:Job)-[:REQUIRES]->(s:Skill {name: $name}) RETURN j.id AS id",
                {"name": skill},
            )
            skill_job_ids = {r["id"] for r in rows}
        except Exception:
            skill_job_ids = set()

    def _pass(row):
        job = row.get("job") or {}
        j_role = row.get("role") or {}
        j_loc = row.get("location") or {}
        j_company = row.get("company") or {}
        if search and search not in (job.get("title") or "").lower() and search not in (job.get("description") or "").lower():
            return False
        if role and j_role.get("name") != role:
            return False
        if location and j_loc.get("city") != location:
            return False
        if remote == "true" and job.get("remote") is not True:
            return False
        if remote == "false" and job.get("remote") is not False:
            return False
        if level and job.get("level") != level:
            return False
        if skill_job_ids is not None and job.get("id") not in skill_job_ids:
            return False
        if industry_company_ids is not None and j_company.get("id") not in industry_company_ids:
            return False
        return True

    if any([search, role, location, remote in ("true", "false"), level, skill, industry]):
        data = [r for r in data if _pass(r)]

    return SuccessResponse(data)


@api_view(["GET"])
def job_detail(request, job_id):
    row = JobService.get_detail(job_id)
    if not row or not row.get("job"):
        return ErrorResponse(404, "Job not found.", status.HTTP_404_NOT_FOUND)
    return SuccessResponse(serialize_neo4j_value(row))


# Alias kept for backwards compat — delegate to the flexible handler above
@api_view(["GET"])
def job_matches(request):
    return job_list_or_matches(request)


@api_view(["GET"])
def job_missing_skills(request, job_id):
    dev_id, error = _require_query_param(request, "dev_id")
    if error:
        return error

    data = JobService.get_missing_skills(job_id, dev_id)
    return SuccessResponse(serialize_neo4j_value(data))


@api_view(["GET"])
def job_similar(request, job_id):
    data = JobService.get_similar_jobs(job_id)
    return SuccessResponse(serialize_neo4j_value(data))


@api_view(["GET"])
def company_list(request):
    data = CompanyService.list_companies()
    return SuccessResponse(serialize_neo4j_value(data))


@api_view(["GET"])
def company_detail(request, company_id):
    company_row = CompanyService.get_detail(company_id)
    if not company_row or not company_row.get("company"):
        return ErrorResponse(404, "Company not found.", status.HTTP_404_NOT_FOUND)
    # enrich with technologies used across its jobs
    techs = CompanyService.get_technologies(company_id)
    result = serialize_neo4j_value(company_row)
    result["technologies"] = serialize_neo4j_value(techs)
    return SuccessResponse(result)


@api_view(["GET"])
def company_jobs(request, company_id):
    data = CompanyService.get_jobs(company_id)
    return SuccessResponse(serialize_neo4j_value(data))


# --- lookup endpoints -------------------------------------------------------

@api_view(["GET"])
def list_roles(request):
    return SuccessResponse(serialize_neo4j_value(MetaService.list_roles()))

@api_view(["GET"])
def list_locations(request):
    return SuccessResponse(serialize_neo4j_value(MetaService.list_locations()))

@api_view(["GET"])
def list_industries(request):
    return SuccessResponse(serialize_neo4j_value(MetaService.list_industries()))

@api_view(["GET"])
def list_skills(request):
    return SuccessResponse(serialize_neo4j_value(MetaService.list_skills()))


@api_view(["GET"])
def skill_resources(request, skill_id):
    data = SkillService.get_learning_resources(skill_id)
    return SuccessResponse(serialize_neo4j_value(data))


@api_view(["GET"])
def skill_related_jobs(request, skill_id):
    # Path uses skill_id for API contract; service queries Technology nodes by id.
    data = SkillService.get_related_tech_jobs(skill_id)
    return SuccessResponse(serialize_neo4j_value(data))


@api_view(["GET"])
def career_path(request):
    current_role_id, error = _require_query_param(request, "current_role_id")
    if error:
        return error

    target_role_id, error = _require_query_param(request, "target_role_id")
    if error:
        return error

    data = SkillService.get_career_path_transitions(current_role_id, target_role_id)
    return SuccessResponse(serialize_neo4j_value(data))


@api_view(["GET"])
def graph_search(request):
    q = request.query_params.get("q", "").strip()
    if not q:
        return SuccessResponse([])
    if len(q) < 2:
        return ErrorResponse(400, "Search query must be at least 2 characters.", status.HTTP_400_BAD_REQUEST)
    rows = ExplorerService.search(q)
    shaped = []
    for r in rows:
        node = serialize_neo4j_value(r.get("node") or {})
        node["label"] = r.get("label")
        shaped.append(node)
    return SuccessResponse(shaped)


@api_view(["GET"])
def neighborhood(request):
    node_id, error = _require_query_param(request, "node_id")
    if error:
        return error

    records = ExplorerService.get_neighborhood(node_id)
    if not records:
        # still return empty graph shape instead of 404 so the UI can show empty-state
        return SuccessResponse({"nodes": [], "relationships": []})
    return SuccessResponse(shape_neighborhood(records))
