class VersionConverter:
    regex = '([0-9]+\.[0-9]+)?'  # X.Y

    def to_python(self, value):
        version = float(value)
        return version
    
    def to_url(self, value):
        return str(value)
