from . import services


def register(request): return services.register(request)
def user_login(request): return services.user_login(request)
def user_logout(request): return services.user_logout(request)
def index(request): return services.index(request)
def account(request): return services.account(request)


