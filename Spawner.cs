using UnityEngine;

public class Spawner : MonoBehaviour
{
    public GameObject prefab; // ลาก Prefab ที่จะ Spawn มาใส่ตรงนี้
    public Transform spawnPoint; // จุดเกิด

    void Start()
    {
        GameObject spawnedObject = Instantiate(prefab, spawnPoint.position, spawnPoint.rotation);
        spawnedObject.transform.localScale = Vector3.one; // (1,1,1)
    }
}