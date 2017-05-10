import json


class ExtraBase:
    def get_extra(self, k=None):
        if not self.extra:
            return None

        try:
            extra = json.loads(self.extra)
        except json.decoder.JSONDecodeError:
            extra = {}

        if k:
            return extra.get(k, None)

        return extra

    def add_extra(self, k, v):
        extra = self.get_extra()
        extra[k] = v
        self.update_extra(extra)

    def update_extra(self, extra):
        self.extra = json.dumps(extra)
        self.save()
