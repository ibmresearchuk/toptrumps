
def line_count(filename):
    try:
        with open(filename) as f:
            for i, l in enumerate(f):
                pass
        return i + 1
    except:
        return 0
