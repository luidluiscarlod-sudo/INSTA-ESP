import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 })
    }

    const apiUrl = "https://instagram120.p.rapidapi.com/api/instagram/profile"

    console.log("[v0] Fetching profile from instagram120 API for:", username)

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-rapidapi-key": "58476d898amsh61d6476db2514cfp114ab2jsn8e290bed9186",
        "x-rapidapi-host": "instagram120.p.rapidapi.com",
      },
      body: JSON.stringify({
        username: username,
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("[v0] Instagram API error:", response.status, errorData)
      return NextResponse.json(
        {
          success: false,
          error: `Instagram API error: ${response.statusText}`,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    console.log("[v0] Instagram API raw response:", JSON.stringify(data, null, 2))
    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response success field:", data.success)
    console.log("[v0] Response result field:", !!data.result)

    if (!data || !data.result) {
      console.log("[v0] No profile data found in response. Raw data:", data)
      return NextResponse.json(
        {
          success: false,
          error: "No profile data found",
        },
        { status: 404 },
      )
    }

    const profile = data.result

    // Extrair contagens de followers, following e posts
    const followersCount = profile.edge_followed_by?.count || 0
    const followingCount = profile.edge_follow?.count || 0
    const postsCount = profile.edge_owner_to_timeline_media?.count || 0

    return NextResponse.json({
      success: true,
      profile: {
        username: profile.username || username,
        full_name: profile.full_name || "",
        biography: profile.biography || "",
        profile_pic_url: profile.profile_pic_url || profile.profile_pic_url_hd || "",
        followers_count: followersCount,
        following_count: followingCount,
        posts_count: postsCount,
        media_count: postsCount,
        is_verified: profile.is_verified || false,
        is_private: profile.is_private || false,
        website: profile.external_url || "",
        email: "",
        phone_number: "",
        follower_count: followersCount,
        raw_data: profile,
      },
    })
  } catch (error: any) {
    console.error("[v0] Error fetching Instagram profile:", error.message || error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch Instagram profile",
      },
      { status: 500 },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
