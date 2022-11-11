from . import services


def create_game(request): return services.create_game(request)
def join_game(request): return services.join_game(request)
def check_game_status(request, game_id): return services.check_game_status(request, game_id)
def send_move(request): return services.send_move(request)
def index(request): return services.index(request)