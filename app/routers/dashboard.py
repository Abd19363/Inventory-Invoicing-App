from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.dashboard import DashboardInsightsResponse
from app.services import dashboard_service


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


# ==========================================
# DASHBOARD INSIGHTS
# ==========================================

@router.get(
    "/insights",
    response_model=DashboardInsightsResponse
)
def get_dashboard_insights(
    db: Session = Depends(get_db)
):

    return dashboard_service.get_dashboard_insights(
        db
    )