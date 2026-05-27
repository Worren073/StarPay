from django.db import models


class StaffMember(models.Model):
    SPECIALTY_CHOICES = (
        ('speed', 'Speed'),
        ('power', 'Power'),
        ('figure_skating', 'Figure Skating'),
    )
    STATUS_CHOICES = (
        ('in_facility', 'In Facility'),
        ('off_duty', 'Off Duty'),
        ('on_ice', 'On Ice'),
    )

    user = models.OneToOneField('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=150)
    specialty = models.CharField(max_length=20, choices=SPECIALTY_CHOICES)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='off_duty')
    athletes_count = models.PositiveIntegerField(default=0)
    next_session_time = models.TimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.specialty})"
