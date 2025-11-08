const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucHR2bHVwZnJleG1paW5iYmJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjYwMjQ3MywiZXhwIjoyMDc4MTc4NDczfQ.HX5Z-VdWamwRD_Tz3Eq-tJ9Gd7csKnhii410yJkpIP4";

async function getWishlistFull() {
    const API_URL = "https://bnptvlupfrexmiinbbbj.supabase.co/rest/v1/wishlist?select=*";
  // Hacemos una sola llamada con relaciones anidadas
  const res = await fetch(`${API_URL}/rest/v1/wishlist?select=*,wishlist_link(store_link(name,link))`, {
    headers: {
      apikey: API_KEY,
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  const data = await res.json();
  
  const result = data.map(item => ({
    id: item.id, // UUID real
    title: item.title,
    detail: item.detail,
    required: item.required,
    selected: item.selected,
    img: item.img,
    sites: (item.wishlist_link || []).map(link => ({
      name: link.store_link?.name || '',
      url: link.store_link?.link || '#'
    }))
  }));

  return result;
}


async function updateSelectedGift(giftId, newSelectedValue) {
  const API_URL = "https://bnptvlupfrexmiinbbbj.supabase.co/rest/v1";
  const url = `${API_URL}/wishlist?id=eq.${encodeURIComponent(giftId)}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: API_KEY,
      Authorization: `Bearer ${API_KEY}`,
      Prefer: "return=minimal"
    },
    body: JSON.stringify({ selected: newSelectedValue })
  });

  if (!res.ok) {
    console.error("Error actualizando cantidad:", await res.text());
  } else {
    console.log(`✅ Regalo ${giftId} actualizado a ${newSelectedValue}`);
  }
}

const SUPABASE_URL = "https://bnptvlupfrexmiinbbbj.supabase.co/rest/v1";

async function getGiftById(giftId) {
  try {
    const res = await fetch(`${SUPABASE_URL}/wishlist?id=eq.${encodeURIComponent(giftId)}&select=id,required,selected`, {
      headers: {
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
      }
    });

    if (!res.ok) {
      console.error("❌ Error consultando regalo:", await res.text());
      return null;
    }

    const [gift] = await res.json();
    return gift || null;
  } catch (err) {
    console.error("❌ Error de red o ejecución en getGiftById:", err);
    return null;
  }
}

async function updateGiftSelected(giftId, newSelectedValue) {
  try {
    const res = await fetch(`${SUPABASE_URL}/wishlist?id=eq.${encodeURIComponent(giftId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: API_KEY,
        Authorization: `Bearer ${API_KEY}`,
        Prefer: "return=minimal"
      },
      body: JSON.stringify({ selected: newSelectedValue })
    });

    if (!res.ok) {
      console.error("❌ Error actualizando regalo:", await res.text());
      return false;
    }

    console.log(`✅ Regalo ${giftId} actualizado a ${newSelectedValue}`);
    return true;
  } catch (err) {
    console.error("❌ Error de red o ejecución en updateGiftSelected:", err);
    return false;
  }
}

