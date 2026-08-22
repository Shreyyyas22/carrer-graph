from rest_framework import status
from rest_framework.views import exception_handler

from graph.exceptions import (
    CognoDBConnectionError,
    CognoDBQueryError,
    NodeNotFoundError,
)
from api.responses import ErrorResponse


def _format_drf_error_detail(detail):
    if isinstance(detail, list):
        return "; ".join(str(item) for item in detail)
    if isinstance(detail, dict):
        parts = []
        for key, value in detail.items():
            parts.append(f"{key}: {_format_drf_error_detail(value)}")
        return "; ".join(parts)
    return str(detail)


def custom_exception_handler(exc, context):
    if isinstance(exc, CognoDBConnectionError):
        return ErrorResponse(503, str(exc), status.HTTP_503_SERVICE_UNAVAILABLE)
    if isinstance(exc, NodeNotFoundError):
        return ErrorResponse(404, str(exc), status.HTTP_404_NOT_FOUND)
    if isinstance(exc, CognoDBQueryError):
        return ErrorResponse(400, str(exc), status.HTTP_400_BAD_REQUEST)

    response = exception_handler(exc, context)
    if response is not None:
        message = _format_drf_error_detail(response.data)
        return ErrorResponse(response.status_code, message, response.status_code)

    return None
