import React, { useState } from 'react';
import type { Device } from '../types';
import { BookUser, Search, Plus, Star, Monitor } from 'lucide-react';

interface AddressBookViewProps {
  devices: Device[];
  onStartSession: (device: Device) => void;
}

export const AddressBookView: React.FC<AddressBookViewProps> = ({ devices, onStartSession }) => {
  const [search, setSearch] = useState('');

  const groups = ['All Contacts', 'Finance & ERP', 'Executive Suite', 'Production Infrastructure', 'R&D Infrastructure'];
  const [selectedGroup, setSelectedGroup] = useState('All Contacts');

  const filtered = devices.filter(d => {
    const matchesGroup = selectedGroup === 'All Contacts' || d.group === selectedGroup;
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.rustDeskId.includes(search);
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-google-sm">
        <div>
          <h1 className="text-xl font-bold text-[#202124] tracking-tight">Enterprise Address Book</h1>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Organized device contacts, pre-shared keys, and access policy groups.
          </p>
        </div>

        <button className="bg-[#1A73E8] hover:bg-[#1557B0] text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span>New Contact Group</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Groups List */}
        <div className="bg-white p-3 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#80868B]">
            Contact Groups
          </div>
          {groups.map(grp => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                selectedGroup === grp
                  ? 'bg-[#E8F0FE] text-[#1A73E8]'
                  : 'text-[#5F6368] hover:bg-[#F3F4F6] hover:text-[#202124]'
              }`}
            >
              <span>{grp}</span>
              <BookUser className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* Right Devices Table */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-[#E5E7EB] shadow-google-sm flex items-center justify-between">
            <div className="relative max-w-sm w-full">
              <input
                type="text"
                placeholder="Search address book..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#F8F9FA] text-xs text-[#202124] pl-9 pr-3 py-2 rounded-xl border border-[#E5E7EB] focus:outline-none"
              />
              <Search className="w-4 h-4 text-[#80868B] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <span className="text-xs text-[#5F6368]">{filtered.length} entry(ies)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(dev => (
              <div key={dev.id} className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-google-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-4 h-4 text-[#1A73E8]" />
                    <span className="font-bold text-xs text-[#202124]">{dev.name}</span>
                  </div>
                  <Star className="w-4 h-4 text-[#FBBC05] fill-[#FBBC05]" />
                </div>
                <div className="text-[11px] text-[#5F6368] font-mono space-y-0.5">
                  <div>ID: {dev.rustDeskId}</div>
                  <div>IP: {dev.ipAddress}</div>
                  <div>Group: {dev.group}</div>
                </div>
                <button
                  onClick={() => onStartSession(dev)}
                  className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-semibold py-2 rounded-xl transition-colors shadow-sm"
                >
                  Connect Session
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
