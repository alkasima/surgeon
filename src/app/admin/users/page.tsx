
// src/app/admin/users/page.tsx
"use client";

import { useEffect, useState, type FormEvent } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, UserPlus, AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createFirebaseUser, deleteFirebaseUser, listFirebaseUsers, updateUserPassword, addCreditsToUser, getUserCredits } from '../actions';

// Mock interface for Firebase UserListData
interface FirebaseUser {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  disabled: boolean;
  credits?: number;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Stores UID of user being deleted
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<string | null>(null);
  const [isAddingCredits, setIsAddingCredits] = useState<string | null>(null);
  
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [adminActionError, setAdminActionError] = useState<string | null>(null);
  
  // Password reset states
  const [passwordResetUser, setPasswordResetUser] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  
  // Credit management states
  const [creditUser, setCreditUser] = useState<string | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState<number>(0);

  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setAdminActionError(null);
    try {
      const result = await listFirebaseUsers();
      if (result.error) {
        setAdminActionError(result.error);
        setUsers([]);
         toast({ title: "Error Fetching Users", description: result.error, variant: "destructive" });
      } else {
        const usersWithCredits = await Promise.all(
          (result.users || []).map(async (user) => {
            const creditsResult = await getUserCredits(user.uid);
            return {
              ...user,
              credits: creditsResult.credits || 0
            };
          })
        );
        setUsers(usersWithCredits);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      setAdminActionError(message);
      setUsers([]);
      toast({ title: "Error", description: `Failed to fetch users: ${message}`, variant: "destructive" });
    }
    setIsLoadingUsers(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (uid: string) => {
    setIsDeleting(uid);
    setAdminActionError(null);
    try {
      const result = await deleteFirebaseUser(uid);
      if (result.error) {
        setAdminActionError(result.error);
        toast({ title: "Error Deleting User", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "User Deleted", description: `User ${uid} has been deleted.` });
        fetchUsers(); // Refresh user list
      }
    } catch (error) {
       const message = error instanceof Error ? error.message : "An unknown error occurred.";
       setAdminActionError(message);
       toast({ title: "Error", description: `Failed to delete user: ${message}`, variant: "destructive" });
    }
    setIsDeleting(null);
  };

  const handleAddUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword) {
      toast({ title: "Missing fields", description: "Email and password are required.", variant: "destructive" });
      return;
    }
    setIsAddingUser(true);
    setAdminActionError(null);
    try {
      const result = await createFirebaseUser(newUserEmail, newUserPassword);
       if (result.error) {
        setAdminActionError(result.error);
        toast({ title: "Error Adding User", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "User Added", description: `User ${result.uid} (${newUserEmail}) created successfully.` });
        setNewUserEmail('');
        setNewUserPassword('');
        fetchUsers(); // Refresh user list
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      setAdminActionError(message);
      toast({ title: "Error", description: `Failed to add user: ${message}`, variant: "destructive" });
    }
    setIsAddingUser(false);
  };

  const handlePasswordReset = async (uid: string) => {
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Invalid Password", description: "Password must be at least 6 characters long.", variant: "destructive" });
      return;
    }
    
    setIsUpdatingPassword(uid);
    setAdminActionError(null);
    try {
      const result = await updateUserPassword(uid, newPassword);
      if (result.error) {
        setAdminActionError(result.error);
        toast({ title: "Error Updating Password", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Password Updated", description: "User password has been updated successfully." });
        setPasswordResetUser(null);
        setNewPassword('');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      setAdminActionError(message);
      toast({ title: "Error", description: `Failed to update password: ${message}`, variant: "destructive" });
    }
    setIsUpdatingPassword(null);
  };

  const handleAddCredits = async (uid: string) => {
    if (creditsToAdd <= 0) {
      toast({ title: "Invalid Amount", description: "Credits to add must be greater than 0.", variant: "destructive" });
      return;
    }
    
    setIsAddingCredits(uid);
    setAdminActionError(null);
    try {
      const result = await addCreditsToUser(uid, creditsToAdd);
      if (result.error) {
        setAdminActionError(result.error);
        toast({ title: "Error Adding Credits", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Credits Added", description: `Successfully added ${creditsToAdd} credits. New total: ${result.newTotal}` });
        setCreditUser(null);
        setCreditsToAdd(0);
        fetchUsers(); // Refresh user list to show updated credits
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      setAdminActionError(message);
      toast({ title: "Error", description: `Failed to add credits: ${message}`, variant: "destructive" });
    }
    setIsAddingCredits(null);
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Add New User</CardTitle>
            <CardDescription>Create a new user account in Firebase Authentication.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newUserEmail">Email</Label>
                  <Input
                    id="newUserEmail"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="newUserPassword">Password</Label>
                  <Input
                    id="newUserPassword"
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <Button type="submit" disabled={isAddingUser} className="w-full sm:w-auto">
                {isAddingUser ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Add User
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">User Management</CardTitle>
            <CardDescription>View and manage registered users.</CardDescription>
          </CardHeader>
          <CardContent>
             {adminActionError && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-md flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold">Admin Action Error:</p>
                    <p>{adminActionError}</p>
                    <p className="text-xs mt-1">Note: User management actions (list, delete, add) require Firebase Admin SDK to be configured on the server. These are currently stubbed.</p>
                </div>
              </div>
            )}
            {isLoadingUsers ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : users.length === 0 && !adminActionError ? (
              <p className="text-muted-foreground text-center py-4">No users found or Admin SDK not configured to list users.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>UID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Sign In</TableHead>
                    <TableHead>Disabled</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium truncate max-w-xs" title={user.uid}>{user.uid}</TableCell>
                      <TableCell className="truncate max-w-xs" title={user.email}>{user.email || 'N/A'}</TableCell>
                      <TableCell className="font-medium text-primary">{user.credits || 0}</TableCell>
                      <TableCell>{user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{user.disabled ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {/* Add Credits Button */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={isAddingCredits === user.uid}>
                                {isAddingCredits === user.uid ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Add Credits
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Add Credits to {user.email}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Current credits: {user.credits || 0}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="py-4">
                                <Label htmlFor="creditsToAdd">Credits to Add</Label>
                                <Input
                                  id="creditsToAdd"
                                  type="number"
                                  min="1"
                                  value={creditUser === user.uid ? creditsToAdd : ''}
                                  onChange={(e) => {
                                    setCreditUser(user.uid);
                                    setCreditsToAdd(parseInt(e.target.value) || 0);
                                  }}
                                  placeholder="Enter number of credits"
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => {
                                  setCreditUser(null);
                                  setCreditsToAdd(0);
                                }}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleAddCredits(user.uid)}>
                                  Add Credits
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          {/* Reset Password Button */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" disabled={isUpdatingPassword === user.uid}>
                                {isUpdatingPassword === user.uid ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                                Reset Password
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reset Password for {user.email}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Enter a new password for this user.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="py-4">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                  id="newPassword"
                                  type="password"
                                  value={passwordResetUser === user.uid ? newPassword : ''}
                                  onChange={(e) => {
                                    setPasswordResetUser(user.uid);
                                    setNewPassword(e.target.value);
                                  }}
                                  placeholder="Enter new password (min 6 characters)"
                                  minLength={6}
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => {
                                  setPasswordResetUser(null);
                                  setNewPassword('');
                                }}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handlePasswordReset(user.uid)}>
                                  Update Password
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          {/* Delete User Button */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" disabled={isDeleting === user.uid}>
                                {isDeleting === user.uid ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the user <code className="font-mono bg-muted px-1 rounded">{user.email || user.uid}</code>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.uid)}>
                                  Delete User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
           {users.length > 0 && <CardFooter><p className="text-xs text-muted-foreground">Displaying {users.length} user(s).</p></CardFooter>}
        </Card>
      </div>
    </MainLayout>
  );
}
