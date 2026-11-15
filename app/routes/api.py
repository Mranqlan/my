from flask import Blueprint, jsonify, request
from app.models import db, CompanySettings

api_bp = Blueprint('api', __name__)

@api_bp.route('/settings', methods=['GET', 'POST'])
def manage_settings():
    settings = CompanySettings.query.first()
    if not settings:
        settings = CompanySettings()
        db.session.add(settings)
        db.session.commit()

    if request.method == 'POST':
        data = request.json
        settings.company_name = data.get('company_name', settings.company_name)
        settings.main_currency = data.get('main_currency', settings.main_currency)
        settings.secondary_currency = data.get('secondary_currency', settings.secondary_currency)
        settings.exchange_rate = float(data.get('exchange_rate', settings.exchange_rate))
        settings.fiscal_year_start = data.get('fiscal_year_start', settings.fiscal_year_start)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'تم حفظ الإعدادات العامة والعملات بنجاح'})

    return jsonify({
        'company_name': settings.company_name,
        'main_currency': settings.main_currency,
        'secondary_currency': settings.secondary_currency,
        'exchange_rate': settings.exchange_rate,
        'fiscal_year_start': settings.fiscal_year_start
    })
