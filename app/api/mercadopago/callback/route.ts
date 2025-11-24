import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MP_CLIENT_ID = process.env.MERCADOPAGO_CLIENT_ID;
const MP_CLIENT_SECRET = process.env.MERCADOPAGO_CLIENT_SECRET;
const MP_REDIRECT_URI = `${process.env.APP_BASE_URL}/api/mercadopago/callback`;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // userId

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.APP_BASE_URL}/dashboard?error=mp_auth_failed`
    );
  }

  try {
    // Intercambiar código por access token
    const tokenResponse = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: MP_CLIENT_ID,
        client_secret: MP_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: MP_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = await tokenResponse.json();
    const { access_token, user_id } = tokenData;

    // Obtener info del usuario de MP
    const userResponse = await fetch(`https://api.mercadopago.com/users/${user_id}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error("Failed to get MP user info");
    }

    const mpUser = await userResponse.json();

    // Actualizar usuario en la base de datos
    await prisma.user.update({
      where: { id: state },
      data: {
        mercadopagoUserId: user_id.toString(),
        mercadopagoToken: access_token,
        mercadopagoEmail: mpUser.email,
        mercadopagoConnected: true,
      },
    });

    return NextResponse.redirect(
      `${process.env.APP_BASE_URL}/dashboard?mp_connected=true`
    );
  } catch (error) {
    console.error("MP OAuth error:", error);
    return NextResponse.redirect(
      `${process.env.APP_BASE_URL}/dashboard?error=mp_auth_failed`
    );
  }
}
