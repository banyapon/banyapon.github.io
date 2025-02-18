using UnityEngine;
using UnityEngine.UI;

public class SoundPlayer : MonoBehaviour
{
    private AudioClip clip;
    private AudioSource audioSource;

    void Start()
    {
        // โหลดไฟล์เสียงจากโฟลเดอร์ Resources
        clip = Resources.Load<AudioClip>("sound");

        // สร้าง AudioSource ขึ้นมาในตัวเกม
        audioSource = gameObject.AddComponent<AudioSource>();
    }

    public void PlaySound()
    {
        // เล่นเสียงเมื่อกดปุ่ม
        if (clip != null)
        {
            audioSource.PlayOneShot(clip);
        }
        else
        {
            Debug.LogError("ไม่พบไฟล์เสียง sound.mp3 ในโฟลเดอร์ Resources");
        }
    }
}