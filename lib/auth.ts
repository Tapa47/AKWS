interface User {
  id: string
  name: string
  email: string
}

// Mock user database
const USERS: Record<string, User & { password: string }> = {
  "1": {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    password: "password123",
  },
}

export async function login(email: string, password: string): Promise<User> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Find user by email
  const user = Object.values(USERS).find((u) => u.email === email)

  if (!user || user.password !== password) {
    throw new Error("Invalid credentials")
  }

  // Set session cookie
  document.cookie = `session=${user.id}; path=/; max-age=86400; SameSite=Strict`

  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function register(name: string, email: string, password: string): Promise<User> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Check if user already exists
  if (Object.values(USERS).some((u) => u.email === email)) {
    throw new Error("User already exists")
  }

  // Create new user
  const id = String(Object.keys(USERS).length + 1)
  const newUser = { id, name, email, password }
  USERS[id] = newUser

  // Set session cookie
  document.cookie = `session=${id}; path=/; max-age=86400; SameSite=Strict`

  const { password: _, ...userWithoutPassword } = newUser
  return userWithoutPassword
}

export async function logout(): Promise<void> {
  // Clear session cookie
  document.cookie = "session=; path=/; max-age=0; SameSite=Strict"
}

export async function getSession(): Promise<User | null> {
  // This function is meant to be used on the server
  // For client-side usage, we'll simulate it

  try {
    // In a client component, we need to parse cookies manually
    const cookieStr = document.cookie
    const cookies = cookieStr.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=")
        acc[key] = value
        return acc
      },
      {} as Record<string, string>,
    )

    const sessionId = cookies.session

    if (!sessionId || !USERS[sessionId]) {
      return null
    }

    const { password: _, ...userWithoutPassword } = USERS[sessionId]
    return userWithoutPassword
  } catch (error) {
    return null
  }
}
