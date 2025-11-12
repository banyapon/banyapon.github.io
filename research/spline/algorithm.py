class Road:
    def __init__(self, road_id, length, nodeS=None, nodeE=None):
        self.id = road_id
        self.length = length
        self.nodeS = nodeS or []  #list of(nextRoadID, nextDir)
        self.nodeE = nodeE or []

class Car:
    def __init__(self, roadno, currentpos=0.0, dir=0):
        self.roadno = roadno      # current ID road
        self.currentpos = currentpos
        self.dir = dir            
        # 0 = NodeS→NodeE 1 = NodeE→NodeS

def isNotEmpty(node):
    #เช็คว่า node มีเส้นทางเชื่อมอยู่
    return node is not None and len(node) > 0

def GetConnection(node):
    #ต่อเส้นแรกจาก NodeS หรือ NodeE
    if node:
        return node[0]  
        #(nextRoad, nextDir)
    return None, None


def MoveForward(car, distance, Road):

    current_road = Road[car.roadno]
    currentpos = car.currentpos
    dir = car.dir

    #คำนวณตำแหน่งใหม่
    if dir == 1:
        new_position = currentpos + distance    #2+6=8
    else:
        new_position = currentpos - distance  #2-3=-1

    #วิ่งเลยฝั่ง NodeS
    if new_position < 0:
        remain = abs(new_position)
        if isNotEmpty(current_road.nodeS):
            nextRoad, nextDir = GetConnection(current_road.nodeS)
            car.roadno = nextRoad
            car.dir = nextDir
            next_road = Road[nextRoad]

            if nextDir == 0:
                car.currentpos = remain
            else:
                car.currentpos = next_road.length - remain
        else:
            car.currentpos = 0

    #วิ่งเลยฝั่ง NodeE
    elif new_position > current_road.length:
        remain = abs(new_position - current_road.length)
        if isNotEmpty(current_road.nodeE):
            nextRoad, nextDir = GetConnection(current_road.nodeE)
            car.roadno = nextRoad
            car.dir = nextDir
            next_road = Road[nextRoad]

            if nextDir == 0:
                car.currentpos = remain
            else:
                car.currentpos = next_road.length - remain
        else:
            car.currentpos = current_road.length

    #ยังอยู่บนถนนเดิม
    else:
        car.currentpos = new_position

    return car.currentpos