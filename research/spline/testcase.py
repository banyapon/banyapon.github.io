class Road:
    def __init__(self, road_id, length, nodeS=None, nodeE=None):
        self.id = road_id
        self.length = length
        self.nodeS = nodeS or []  # [(nextRoad, nextDir)]
        self.nodeE = nodeE or []

class Car:
    def __init__(self, roadno, currentpos=0.0, dir=0):
        self.roadno = roadno
        self.currentpos = currentpos
        self.dir = dir

def isNotEmpty(node): return node is not None and len(node) > 0

def GetConnection(node):
    if node: return node[0]
    return None, None

def MoveForward(car, distance, Road):
    currentRoad = Road[car.roadno]
    currentpos = car.currentpos
    dir = car.dir  # เก็บทิศเดิม

    # เดินหน้า: หาก dir==0 (S->E) บวก, หาก dir==1 (E->S) ลบ
    new_position = currentpos + distance if dir == 0 else currentpos - distance

    # ---- ชนฝั่ง NodeS (ต่ำกว่า 0) ----
    if new_position < 0:
        remain = -new_position  # abs(new_position)
        NodeS = currentRoad.nodeS
        if isNotEmpty(NodeS):
            nextRoad, nextDir = GetConnection(NodeS)
            car.roadno = nextRoad
            car.dir = nextDir  # สำคัญ: อัปเดตทิศใหม่เสมอ
            nextRoadObj = Road[nextRoad]

            # เข้าทาง NodeS ของถนนใหม่
            car.currentpos = remain if nextDir == 0 else nextRoadObj.length - remain
            print(f"pass NodeS to Road[{nextRoad}] remain={remain}")
        else:
            car.currentpos = 0.0
            print("end NodeS is 0")

    # ---- ชนฝั่ง NodeE (เกินความยาว) ----
    elif new_position > currentRoad.length:
        remain = new_position - currentRoad.length
        NodeE = currentRoad.nodeE
        if isNotEmpty(NodeE):
            nextRoad, nextDir = GetConnection(NodeE)
            car.roadno = nextRoad
            car.dir = nextDir  # สำคัญ: อัปเดตทิศใหม่เสมอ
            nextRoadObj = Road[nextRoad]

            # เข้าทาง NodeE ของถนนใหม่
            car.currentpos = remain if nextDir == 0 else nextRoadObj.length - remain
            print(f"pass NodeE to Road[{nextRoad}] remain={remain}")
        else:
            car.currentpos = float(currentRoad.length)
            print("NodeE หยุดที่ปลายถนน")

    # ---- ยังอยู่บนถนนเดิม ----
    else:
        car.currentpos = new_position
        print(f"ยังอยู่บนถนนเดิม ตำแหน่ง={car.currentpos:.2f}")

    print(f"สรุป RoadNo[{car.roadno}], Position={car.currentpos:.2f}, Dir={car.dir}")
    return car


def MoveBackward(car, distance, Road):
    currentRoad = Road[car.roadno]
    currentpos = car.currentpos
    dir = car.dir  # เก็บทิศเดิม

    # โหมดถอยหลัง: ตรงข้ามกับ forward
    new_position = currentpos - distance if dir == 0 else currentpos + distance

    # ---- ชนฝั่ง NodeS (ตำแหน่ง < 0) ----
    if new_position < 0:
        remain = abs(new_position)
        NodeS = currentRoad.nodeS
        if isNotEmpty(NodeS):
            nextRoad, nextDir = GetConnection(NodeS)
            car.roadno = nextRoad
            car.dir = nextDir   # อัปเดตทิศทางตามถนนใหม่
            nextRoadObj = Road[nextRoad]

            # เข้าทาง NodeS ของถนนใหม่:
            # หาก nextDir == 0 (S->E) วางที่ระยะ remain จากต้น S
            # หาก nextDir == 1 (E->S) วางที่ length - remain จากปลาย E
            car.currentpos = remain if nextDir == 0 else nextRoadObj.length - remain
            print(f"pass NodeS to Road[{nextRoad}] remain={remain}")
        else:
            car.currentpos = 0
            print("end NodeS is 0")

    # ---- ชนฝั่ง NodeE (ตำแหน่ง > length) ----
    elif new_position > currentRoad.length:
        remain = new_position - currentRoad.length
        NodeE = currentRoad.nodeE
        if isNotEmpty(NodeE):
            nextRoad, nextDir = GetConnection(NodeE)
            car.roadno = nextRoad
            car.dir = nextDir   # อัปเดตทิศทางตามถนนใหม่
            nextRoadObj = Road[nextRoad]

            # เข้าทาง NodeE ของถนนใหม่:
            car.currentpos = remain if nextDir == 0 else nextRoadObj.length - remain
            print(f"pass NodeE to Road[{nextRoad}] remain={remain}")
        else:
            car.currentpos = currentRoad.length
            print("NodeE หยุดที่ปลายถนน")

    # ---- ยังอยู่ถนนเดิม ----
    else:
        car.currentpos = new_position
        print(f"ยังอยู่บนถนนเดิม ตำแหน่ง={car.currentpos:.2f}")

    print(f"สรุป RoadNo[{car.roadno}], Position={car.currentpos:.2f}, Dir={car.dir}")
    return car



Road = {
    1: Road(1, 5, nodeS=[(3, 1)], nodeE=[(2, 0)]),
    2: Road(2, 3, nodeS=[], nodeE=[(1, 1)]),
    3: Road(3, 4, nodeS=[], nodeE=[(1, 0)])
}

# ---- Test Case ----
roadno = 1
currentpos =2
car = Car(roadno, currentpos, dir=0)

#print("Test dir 0: NodeS -> NodeE 1 = NodeE -> NodeS")
print("Test dir 0")

for i in range(5):
    print(f"Move {i+1}:")
    #MoveForward(car, 3, Road)
    MoveBackward(car, 3, Road)
    
