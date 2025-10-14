export class userInfo {
  userfullname: string;
  permission: string;
  username: string;
  constructor(userfullname: string, permission: string, username: string) {
    this.permission = permission; // ✅ 在建構子中明確指派值
    this.userfullname = userfullname;
    this.username = username;
  }

  updateUserFullName(userfullname: string): void {
    this.userfullname = userfullname;
  }
  updatepermission(permission: string): void {
    this.permission = permission;
  }
  updateUserName(username: string): void {
    this.userfullname = username;
  }
  clean(): void {
    this.userfullname = "";
    this.permission = "";
    this.username = "";
  }
  getUserfullname(): string {
    return this.userfullname;
  }
  getPermission(): string {
    return this.permission;
  }
  getUsername(): string {
    return this.username;
  }
}
