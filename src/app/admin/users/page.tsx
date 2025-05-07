'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, MoreHorizontal, Search, Users2, UserPlus } from 'lucide-react';
import type { User, UserRole } from '@/lib/types';
import { getUsers, addUser, updateUserRole, deleteUser } from '@/lib/actions'; // Placeholder actions
import { useToast } from '@/hooks/use-toast';
import { mockUsers } from '@/lib/data'; // Using mock data for now

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(mockUsers); // Initialize with mock data
  const [isLoading, setIsLoading] = useState(false); // Set to false as we use mock data initially
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  
  // Form state for adding new user
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('staff');

  const { toast } = useToast();

  // Commenting out useEffect for fetching real users for now, using mockUsers
  /*
  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch users.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, [toast]);
  */

  const handleAddUser = async () => {
    if (!newUserName || !newUserEmail) {
        toast({ title: "Error", description: "Name and Email are required.", variant: "destructive" });
        return;
    }
    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(newUserEmail)) {
        toast({ title: "Error", description: "Invalid email format.", variant: "destructive" });
        return;
    }

    // Simulate adding user
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      createdAt: new Date().toISOString(),
    };
    // const result = await addUser(newUser); // Uncomment when action is implemented
    // if (result.success) {
    //   setUsers(prev => [...prev, newUser]); // Assuming addUser returns the new user or confirms add
    //   toast({ title: "Success", description: "User added successfully." });
    //   setIsAddUserDialogOpen(false);
    //   setNewUserName('');
    //   setNewUserEmail('');
    //   setNewUserRole('staff');
    // } else {
    //   toast({ title: "Error", description: result.error || "Failed to add user.", variant: "destructive" });
    // }
    setUsers(prev => [...prev, newUser]);
    toast({ title: "Success", description: "User added successfully (simulated)." });
    setIsAddUserDialogOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('staff');
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    // Simulate role update
    // const result = await updateUserRole(userId, newRole);
    // if (result.success) {
    //   setUsers(prevUsers => prevUsers.map(user => user.id === userId ? { ...user, role: newRole } : user));
    //   toast({ title: "Success", description: `User role updated to ${newRole}.` });
    // } else {
    //   toast({ title: "Error", description: "Failed to update user role.", variant: "destructive" });
    // }
    setUsers(prevUsers => prevUsers.map(user => user.id === userId ? { ...user, role: newRole } : user));
    toast({ title: "Success", description: `User role updated to ${newRole} (simulated).` });
  };
  
  const handleDeleteUser = async (userId: string) => {
    // Simulate user deletion
    // const result = await deleteUser(userId);
    // if(result.success) {
    //   setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    //   toast({ title: "Success", description: "User deleted successfully." });
    // } else {
    //   toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
    // }
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    toast({ title: "Success", description: "User deleted successfully (simulated)." });
  };


  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-semibold">User Management</h1>
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" /> Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Enter the details for the new system user.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="John Doe" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="user@example.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUserRole} onValueChange={(value: UserRole) => setNewUserRole(value)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>Cancel</Button>
              <Button type="button" onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search users by name or email..."
          className="w-full rounded-lg bg-background pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
          <CardDescription>Manage users who can access and operate the system. Assign roles to control permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-10">
              <Users2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No users found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm ? "Try adjusting your search term." : "Add a new user to get started."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Joined On</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="capitalize">
                            {user.role} <Edit className="ml-2 h-3 w-3 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                          <DropdownMenuRadioGroup value={user.role} onValueChange={(newRole) => handleRoleChange(user.id, newRole as UserRole)}>
                            <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="staff">Staff</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit User Details</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(user.id)}>
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
       <Card className="mt-6 border-blue-500 bg-blue-50 dark:bg-blue-900/30">
        <CardHeader className="flex flex-row items-center gap-2">
          <Users2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <CardTitle className="text-blue-700 dark:text-blue-300">User Roles & Permissions</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 dark:text-blue-400 text-sm">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Admin:</strong> Full access to all system features, including user management, financial reports, and system settings. Can perform all CRUD operations.</li>
            <li><strong>Staff:</strong> Access to inventory, sales, and purchases modules. Can perform CRUD operations on sales and purchases data as delegated. Cannot access user management or advanced financial reporting.</li>
          </ul>
          <p className="mt-3">Data storage and user authentication are intended to be integrated with Supabase. Docker integration would be for development and deployment environments.</p>
        </CardContent>
      </Card>
    </div>
  );
}
