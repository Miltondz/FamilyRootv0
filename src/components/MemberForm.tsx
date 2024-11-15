import React, { useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type FamilyMember = Database['public']['Tables']['family_members']['Row'];

interface MemberFormProps {
  treeId: string;
  member: FamilyMember | null;
  members: FamilyMember[];
  onClose: () => void;
  onSave: (member: FamilyMember) => void;
}

export default function MemberForm({ treeId, member, members, onClose, onSave }: MemberFormProps) {
  const [formData, setFormData] = useState({
    first_name: member?.first_name || '',
    last_name: member?.last_name || '',
    birth_date: member?.birth_date || '',
    death_date: member?.death_date || '',
    gender: member?.gender || '',
    notes: member?.notes || '',
    parent_ids: member?.parent_ids || [],
    spouse_ids: member?.spouse_ids || [],
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
      setError(null);

      if (!treeId) {
        throw new Error('No tree ID provided');
      }

      // Prepare the member data
      const memberData: Partial<FamilyMember> = {
        tree_id: treeId,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        gender: formData.gender || null,
        notes: formData.notes?.trim() || null,
        parent_ids: formData.parent_ids,
        spouse_ids: formData.spouse_ids,
        ...(formData.birth_date ? { birth_date: formData.birth_date } : {}),
        ...(formData.death_date ? { death_date: formData.death_date } : {}),
      };

      let result;

      if (member?.id) {
        // Update existing member
        const { data, error: updateError } = await supabase
          .from('family_members')
          .update(memberData)
          .eq('id', member.id)
          .select()
          .single();

        if (updateError) throw updateError;
        result = data;
      } else {
        // Create new member - let Supabase generate the UUID
        const { data, error: insertError } = await supabase
          .from('family_members')
          .insert([memberData])
          .select()
          .single();

        if (insertError) throw insertError;
        result = data;
      }

      if (!result) {
        throw new Error('Failed to save member');
      }

      onSave(result);
      onClose();
    } catch (err) {
      console.error('Error saving member:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while saving the member');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            {member ? 'Edit Member' : 'Add New Member'}
          </h2>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              required
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              required
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Birth Date
            </label>
            <input
              type="date"
              value={formData.birth_date}
              onChange={(e) => setFormData({ ...formData, birth_date: e.target.value || null })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Death Date
            </label>
            <input
              type="date"
              value={formData.death_date}
              onChange={(e) => setFormData({ ...formData, death_date: e.target.value || null })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              disabled={saving}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Parents
            </label>
            <select
              multiple
              value={formData.parent_ids}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, parent_ids: values });
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              disabled={saving}
            >
              {members
                .filter(m => m.id !== member?.id)
                .map(m => (
                  <option key={m.id} value={m.id}>
                    {m.first_name} {m.last_name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
              disabled={saving}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : member ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}