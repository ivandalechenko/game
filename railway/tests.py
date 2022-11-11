import json

a = json.loads('[{"x":1,"y":2,"type":3,"rotate":1},{"x":1,"y":2,"type":3,"rotate":1},{"x":1,"y":2,"type":3,"rotate":1}]')
print(a)
for element in a:
    print(element)

print(a[2]['x'])