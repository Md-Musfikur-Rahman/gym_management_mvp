export function throwOnSupabaseError(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}
