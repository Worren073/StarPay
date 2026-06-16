from django.db import migrations, models


def copy_coaches(apps, schema_editor):
    Athlete = apps.get_model('athletes', 'Athlete')
    for athlete in Athlete.objects.all():
        if athlete.coach_id:
            athlete.coaches.add(athlete.coach_id)


class Migration(migrations.Migration):

    dependencies = [
        ('athletes', '0005_alter_athlete_form_score_alter_athlete_speed_score_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='athlete',
            name='coaches',
            field=models.ManyToManyField(blank=True, related_name='athletes', to='staff.staffmember'),
        ),
        migrations.RunPython(copy_coaches, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='athlete',
            name='coach',
        ),
    ]
