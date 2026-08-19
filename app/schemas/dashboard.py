from decimal import Decimal

from pydantic import BaseModel


class DashboardInsightsResponse(BaseModel):

    total_products: int

    total_stock_value: Decimal

    total_revenue: Decimal

    total_invoices: int

    low_stock_products: int

    out_of_stock_products: int