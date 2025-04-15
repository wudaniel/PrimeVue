export class userInfo {
    userfullname: string
    permission: string
  
    constructor(userfullname: string, permission: string) {
      this.permission = permission // ✅ 在建構子中明確指派值
      this.userfullname = userfullname
    }
  
    updateUserFullName(userfullname: string): void {
      this.userfullname = userfullname
    }
    updatepermission(permission: string): void {
      this.permission = permission
    }
    clean(): void {
      this.userfullname = ''
      this.permission = ''
    }
    getUserfullname(): string {
      return this.userfullname
    }
    getPermission(): string {
      return this.permission
    }
  }
  