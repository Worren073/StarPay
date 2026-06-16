from django.apps import AppConfig


class AthletesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.athletes'

    def ready(self):
        import apps.athletes.signals
