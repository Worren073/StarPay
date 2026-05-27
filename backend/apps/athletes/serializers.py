from rest_framework import serializers
from .models import Athlete


class AthleteSerializer(serializers.ModelSerializer):
    coach_name = serializers.CharField(source='coach.name', read_only=True)

    class Meta:
        model = Athlete
        fields = '__all__'

    def validate_speed_score(self, value):
        if value > 100:
            raise serializers.ValidationError("Score cannot exceed 100")
        return value

    def validate_technique_score(self, value):
        if value > 100:
            raise serializers.ValidationError("Score cannot exceed 100")
        return value

    def validate_form_score(self, value):
        if value > 100:
            raise serializers.ValidationError("Score cannot exceed 100")
        return value
