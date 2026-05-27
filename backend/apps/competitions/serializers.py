from rest_framework import serializers
from .models import Competition, Result


class ResultSerializer(serializers.ModelSerializer):
    athlete_name = serializers.CharField(source='athlete.name', read_only=True)

    class Meta:
        model = Result
        fields = '__all__'


class CompetitionSerializer(serializers.ModelSerializer):
    results_count = serializers.SerializerMethodField()

    class Meta:
        model = Competition
        fields = '__all__'

    def get_results_count(self, obj):
        return obj.results.count()


class CompetitionDetailSerializer(serializers.ModelSerializer):
    results = ResultSerializer(many=True, read_only=True)
    results_count = serializers.SerializerMethodField()

    class Meta:
        model = Competition
        fields = '__all__'

    def get_results_count(self, obj):
        return obj.results.count()
