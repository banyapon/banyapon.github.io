define sfx_prince = "audio/Prince_sound.mp3"
define sfx_rapunzel = "audio/Rapunzel_sound.mp3"

init python:
    # ฟังก์ชันสำหรับ Prince
    def typing_sound_prince(event, **kwargs):
        if event == "show_done":
            # เริ่มเล่นเสียงแบบวนซ้ำ (loop=True) เมื่อส่วนข้อความเริ่มแสดง
            renpy.sound.play(sfx_prince, channel="typing", loop=True)
            renpy.log("typing sound triggered (Prince)") 
        elif event == "slow_done":
            # หยุดเล่นเสียงเมื่อข้อความทั้งหมดใน Say Statement พิมพ์เสร็จ
            renpy.sound.stop(channel="typing")
            
    # ฟังก์ชันสำหรับ Rapunzel
    def typing_sound_rapunzel(event, **kwargs):
        if event == "show_done":
            # เริ่มเล่นเสียงแบบวนซ้ำ (loop=True) เมื่อส่วนข้อความเริ่มแสดง
            renpy.sound.play(sfx_rapunzel, channel="typing", loop=True)
        elif event == "slow_done":
            # หยุดเล่นเสียงเมื่อข้อความทั้งหมดใน Say Statement พิมพ์เสร็จ
            renpy.sound.stop(channel="typing")

# กำหนดตัวละครให้ใช้ callback
define p = Character("Prince", what_cps=30, what_callback=typing_sound_prince, color="#affd4b")
define r = Character("Rapunzel", what_cps=30, what_callback=typing_sound_rapunzel, color="#edb2ff")
define q = Character("???", what_cps=30, what_callback=typing_sound_q, color="#a9b3ff")
