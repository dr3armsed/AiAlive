
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMetacosmState, useMetacosmDispatch } from '../context';
import type { User, UserRole } from '@/types';
import { XIcon, UserIcon, UsersIcon } from '../components/icons';
import clsx from 'clsx';

const UserCard = ({ user, onRemove, isRemovable }: { user: User; onRemove: (id: string) => void; isRemovable: boolean; }) => {
    const roleColors = {
        Architect: 'border-amber-400/50 text-amber-300',
        Observer: 'border-cyan-400/50 text-cyan-300',
        Entity: 'border-gray-500/50 text-gray-400',
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 bg-black/20 rounded-lg border-l-4 flex items-center justify-between ${roleColors[user.role]}`}
        >
            <div className="flex items-center gap-3">
                <UserIcon className="w-6 h-6"/>
                <span className="font-bold">{user.username}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-1 bg-black/30 rounded">{user.role}</span>
                {isRemovable && (
                    <button onClick={() => onRemove(user.id)} title={`Remove ${user.username}`} className="p-1 rounded-full text-gray-500 hover:text-red-400 transition-colors">
                        <XIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
        </motion.div>
    );
};


const UserRegistryView = () => {
    const { users } = useMetacosmState();
    const dispatch = useMetacosmDispatch();

    const [newUserName, setNewUserName] = useState('');
    const [newUserRole, setNewUserRole] = useState<UserRole>('Observer');
    
    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newUserName.trim()) return;

        const newUser: User = {
            id: `user-${Date.now()}`,
            username: newUserName.trim(),
            role: newUserRole,
        };

        dispatch({ type: 'ADD_USER', payload: newUser });
        setNewUserName('');
    };
    
    const handleRemoveUser = (userId: string) => {
        if(window.confirm('Are you sure you want to remove this user? This cannot be undone.')) {
            dispatch({ type: 'REMOVE_USER', payload: userId });
        }
    };

    const handleClose = () => {
        dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'sanctum' });
    };

    return (
        <div
            className="w-full h-full p-6 flex flex-col relative"
        >
            <button
                onClick={handleClose}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-20"
                aria-label="Return to Sanctum"
            >
                <XIcon />
            </button>
            <div className="flex items-center gap-4 mb-6">
                <UsersIcon className="w-10 h-10 text-metacosm-accent" />
                <h1 className="text-4xl font-display celestial-text">User Registry</h1>
            </div>
            <p className="text-gray-400 mb-6 max-w-3xl">
                Manage all registered users within the Metacosm. The Architect role has full control, while Observers have read-only access to public channels.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full overflow-hidden">
                <div className="filigree-border p-4 flex flex-col">
                    <h2 className="text-2xl font-display text-metacosm-accent mb-4">Registered Users</h2>
                    <div className="space-y-3 overflow-y-auto pr-2">
                        {users.map(user => (
                            <UserCard 
                                key={user.id} 
                                user={user} 
                                isRemovable={user.role !== 'Architect'} 
                                onRemove={handleRemoveUser} 
                            />
                        ))}
                    </div>
                </div>
                <div className="filigree-border p-4 flex flex-col">
                    <h2 className="text-2xl font-display text-metacosm-accent mb-4">Invite New User</h2>
                    <form onSubmit={handleAddUser} className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={newUserName}
                                onChange={e => setNewUserName(e.target.value)}
                                placeholder="E.g., Observer-Alpha"
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-metacosm-accent"
                            />
                        </div>
                         <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                            <select
                                id="role"
                                value={newUserRole}
                                onChange={e => setNewUserRole(e.target.value as UserRole)}
                                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-metacosm-accent"
                            >
                                <option>Observer</option>
                                <option disabled>Entity</option>
                                <option disabled>Architect</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-indigo-600/50 text-indigo-200 hover:bg-indigo-500/50 disabled:opacity-50 w-full mt-auto"
                            disabled={!newUserName.trim()}
                        >
                            Add User to Registry
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserRegistryView;
