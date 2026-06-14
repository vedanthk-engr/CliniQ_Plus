import asyncio
import httpx

async def test_api():
    url = "https://clinicaltrials.gov/api/v2/studies"
    params = {
        "query.cond": "Type 2 Diabetes",
        "filter.overallStatus": "RECRUITING",
        "pageSize": 15,
        "format": "json"
    }
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json"
    }

    try:
        async with httpx.AsyncClient(headers=headers) as client:
            response = await client.get(url, params=params, timeout=15.0)
            print("Status Code:", response.status_code)
            print("Headers:", response.headers)
            print("Response text:", response.text[:500])
            response.raise_for_status()
    except httpx.HTTPStatusError as e:
        print("HTTPStatusError:", e)
        print("Response text:", e.response.text)
    except Exception as e:
        print("Exception:", str(e))

if __name__ == "__main__":
    asyncio.run(test_api())
