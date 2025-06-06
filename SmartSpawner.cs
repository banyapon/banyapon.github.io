using UnityEngine;

public class SmartSpawner : MonoBehaviour
{
    public GameObject prefab; // Prefab ที่จะ spawn
    public string parentName = "ParentObject"; // ชื่อวัตถุแม่ใน scene

    void Start()
    {
        // 1. ค้นหาวัตถุแม่จากชื่อ
        GameObject parentObj = GameObject.Find(parentName);
        if (parentObj == null)
        {
            Debug.LogWarning("Parent object not found!");
            return;
        }

        // 2. สร้าง prefab โดยไม่มี parent ชั่วคราว
        GameObject spawned = Instantiate(prefab);

        // 3. Set เป็นลูกของ parent แล้ว reset transform
        Transform t = spawned.transform;
        t.SetParent(parentObj.transform, false); // false = รักษา local transform เดิม (แต่เราจะ reset ต่อไป)

        t.localPosition = Vector3.zero;            // Reset localPosition
        t.localRotation = Quaternion.identity;     // Reset localRotation
        t.localScale = Vector3.one;                // Reset localScale
    }
}