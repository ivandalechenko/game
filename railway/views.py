from . import services


def index(request): return services.index(request)
def create_game(request): return services.create_game(request)
def join_game(request): return services.join_game(request)
def send_move(request): return services.send_move(request)
def get_tiles(request): return services.get_tiles(request)
def check_game_status(request): return services.check_game_status(request)
def get_game_field(request): return services.get_game_field(request)
def get_status(request): return services.get_status(request)
def get_winners(request): return services.get_winners(request)
def get_stage_scores_timer(request): return services.get_stage_scores_timer(request)
def start_game(request): return services.start_game(request)
def get_games(request): return services.get_games(request)
def creating_game(request): return services.creating_game(request)
def game_over_time_out(request): return services.game_over_time_out(request)