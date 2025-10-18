"use client"
import { checkUserRole } from "./actions"
import RoleSelectionFormComponent from "./role-selection-form"

export default async function SelectRolePage() {
  await checkUserRole()

  return <RoleSelectionFormComponent />
}
