class Road:
    """
    id: หมายเลขถนน
    length: ความยาวถนน
    nodeS, nodeE: [(nextRoad, nextDir)]      # สำรองเมื่อไม่มี LaneS/LaneE
    laneS, laneE: [(nextRoad, nextDir, nextLane)]
    """
    def __init__(self, road_id, length, nodeS=None, nodeE=None, laneS=None, laneE=None):
        self.id = int(road_id)
        self.length = float(length)
        self.nodeS = nodeS or []
        self.nodeE = nodeE or []
        self.laneS = laneS or []
        self.laneE = laneE or []

class Car:
    """
    roadno: ถนนปัจจุบัน
    currentpos: ตำแหน่งจาก NodeS (0..length)
    dir: 0 = S->E, 1 = E->S
    lane: เลนปัจจุบัน (int)
    """
    def __init__(self, roadno, currentpos=0.0, dir=0, lane=0):
        self.roadno = int(roadno)
        self.currentpos = float(currentpos)
        self.dir = int(dir)
        self.lane = int(lane)

# -----------------------------
# Helpers
# -----------------------------
def isNotEmpty(lst): 
    return bool(lst)

def get_first(pair_list):
    # NodeS/NodeE: [(nextRoad, nextDir)] -> first or (None,None)
    return pair_list[0] if pair_list else (None, None)

def pick_lane_connection(road, side, cur_lane):
    """
    เลือกคอนเนกชันตามเลน; side ∈ {'S','E'}
    1) ถ้ามี nextLane == cur_lane ให้เลือกอันนั้น
    2) ไม่มีก็ใช้รายการแรก
    คืนค่า (nextRoad, nextDir, nextLane) หรือ (None,None,None)
    """
    options = road.laneS if side == 'S' else road.laneE
    if not options:
        return None, None, None
    for (nr, nd, nl) in options:
        if nl == cur_lane:
            return nr, nd, nl
    return options[0]  # default

def place_on_next_road(nextRoadObj, nextDir, remain):
    """
    วางตำแหน่งจากระยะคงเหลือ:
    - ถ้า nextDir==0 (S->E): pos = remain
    - ถ้า nextDir==1 (E->S): pos = length - remain
    และ clamp อยู่ในช่วง [0, length]
    """
    if nextDir == 0:
        pos = remain
    else:
        pos = nextRoadObj.length - remain
    return max(0.0, min(nextRoadObj.length, pos))

# -----------------------------
# Core: moveCar()
# -----------------------------
def moveCar(car, distance, mode, Roads, verbose=True, max_steps=1000, eps=1e-9):
    """
    รวมการเดินหน้า/ถอยหลัง + LaneS/LaneE + เชนหลายถนน
    Args:
      car: Car
      distance: ระยะที่จะเคลื่อน (บวกเท่านั้น; ถ้าเผลอติดลบจะสลับ mode อัตโนมัติ)
      mode: 'forward' | 'backward'
      Roads: dict[int, Road]
      verbose: พิมพ์ log หรือไม่
      max_steps: กันลูปผิดพลาด
    Returns:
      car (อัปเดต inplace)
    """
    # 0)  distance / mode
    move_left = float(distance)
    if move_left < 0:
        mode = 'backward' if mode == 'forward' else 'forward'
        move_left = abs(move_left)

    steps = 0
    while move_left > eps:
        steps += 1
        if steps > max_steps:
            if verbose:
                print("[warn] too many steps; break.")
            break

        road = Roads[car.roadno]
        cur  = car.currentpos
        dr   = car.dir

        # 1)  (mode, dir)
        if mode == 'forward':
            delta = move_left if dr == 0 else -move_left
        else:  # backward
            delta = -move_left if dr == 0 else move_left

        newpos = cur + delta

        # 2) boundary checks
        if newpos < 0.0:
            # --- Cross NodeS ---
            overshoot = -newpos
            car.currentpos = 0.0
            move_left = overshoot

            nr, nd, nl = pick_lane_connection(road, 'S', car.lane)  # lane first
            used_lane = (nr is not None)

            if not used_lane:
                if isNotEmpty(road.nodeS):
                    nr, nd = get_first(road.nodeS)
                    nl = car.lane  # keep lane
                else:
                    move_left = 0.0
                    if verbose:
                        print("Stop @ NodeS (no connection)")
                    break

            car.roadno, car.dir, car.lane = nr, nd, nl
            nextRoadObj = Roads[nr]
            car.currentpos = place_on_next_road(nextRoadObj, nd, overshoot)

            if verbose:
                via = "LaneS" if used_lane else "NodeS"
                print(f"pass {via} -> Road[{nr}], dir={nd}, lane={nl}, pos={car.currentpos:.2f}, remain={overshoot:.2f}")

        elif newpos > road.length:
            # --- Cross NodeE ---
            overshoot = newpos - road.length
            car.currentpos = road.length
            move_left = overshoot

            nr, nd, nl = pick_lane_connection(road, 'E', car.lane)  # lane first
            used_lane = (nr is not None)

            if not used_lane:
                if isNotEmpty(road.nodeE):
                    nr, nd = get_first(road.nodeE)
                    nl = car.lane
                else:
                    move_left = 0.0
                    if verbose:
                        print("Stop @ NodeE (no connection)")
                    break

            car.roadno, car.dir, car.lane = nr, nd, nl
            nextRoadObj = Roads[nr]
            car.currentpos = place_on_next_road(nextRoadObj, nd, overshoot)

            if verbose:
                via = "LaneE" if used_lane else "NodeE"
                print(f"pass {via} -> Road[{nr}], dir={nd}, lane={nl}, pos={car.currentpos:.2f}, remain={overshoot:.2f}")

        else:
            # --- road ---
            car.currentpos = newpos
            move_left = 0.0
            if verbose:
                print(f"stay Road[{car.roadno}] pos={car.currentpos:.2f}, dir={car.dir}, lane={car.lane}")

    if verbose:
        print(f"Final: Road[{car.roadno}], pos={car.currentpos:.2f}, dir={car.dir}, lane={car.lane}")
    return car

# ----------------------------- test -----------------------------
Roads = {
    1: Road(1, 5, nodeS=[(3,1)], nodeE=[(2,0)],
            laneS=[(3,1,0)], laneE=[(2,0,1)]),
    2: Road(2, 3, nodeS=[], nodeE=[(1,1)],
            laneS=[], laneE=[(1,1,0)]),
    3: Road(3, 4, nodeS=[], nodeE=[(1,0)],
            laneS=[], laneE=[(1,0,0)])
}

car = Car(roadno=1, currentpos=2, dir=0, lane=0)

print("Forward 4:")
moveCar(car, 4, mode="forward", Roads=Roads)  

print("\nBackward 5:")
moveCar(car, 5, mode="backward", Roads=Roads) 
