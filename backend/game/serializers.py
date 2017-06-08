from rest_framework import serializers


class GameSerializer(serializers.Serializer):
    pk = serializers.IntegerField(read_only=True)
    name = serializers.CharField()
    desc = serializers.SerializerMethodField('get_desc_html')
    visible_players = serializers.BooleanField()

    def get_desc_html(self, game):
        return game.get_desc_html()


class ChallengeSerializer(serializers.Serializer):
    pk = serializers.IntegerField(read_only=True)
    name = serializers.CharField()
    desc = serializers.SerializerMethodField('get_desc_html')
    ctype = serializers.CharField()

    def get_desc_html(self, challenge):
        return challenge.get_desc_html()


class FullChallengeSerializer(ChallengeSerializer):
    solution = serializers.CharField()
    options = serializers.SerializerMethodField()
    depends = ChallengeSerializer(many=True)

    def get_options(self, ch):
        return ch.get_extra('options')


class FullGameSerializer(GameSerializer):
    challenges = FullChallengeSerializer(many=True)
    solution = serializers.CharField()
    options = serializers.SerializerMethodField()

    def get_options(self, game):
        return game.get_extra('options')
