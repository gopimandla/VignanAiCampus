import React, { useState, useEffect } from 'react';
import {
  Database,
  Building,
  GraduationCap,
  PackageCheck,
  Building2,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  AlertTriangle,
  History,
  Shield,
  Search,
  RefreshCw
} from 'lucide-react';
import {
  Venue,
  ResourceItem,
  FacultyMember,
  DepartmentItem,
  AuditLogItem
} from '../types';
import {
  fetchAdminVenues,
  createAdminVenue,
  updateAdminVenue,
  deleteAdminVenue,
  fetchAdminResources,
  createAdminResource,
  updateAdminResource,
  deleteAdminResource,
  fetchAdminFaculty,
  createAdminFaculty,
  updateAdminFaculty,
  deleteAdminFaculty,
  fetchAdminDepartments,
  createAdminDepartment,
  fetchAdminAuditLogs
} from '../services/api';

export const MasterDataConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'venues' | 'resources' | 'faculty' | 'departments' | 'audit'>('venues');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Modal State
  const [modalType, setModalType] = useState<'venue' | 'resource' | 'faculty' | 'department' | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form fields
  const [venueForm, setVenueForm] = useState({
    name: '',
    category: 'Seminar Hall',
    block: 'Central Academic Block',
    capacity: 300,
    ac: true,
    av_equipped: true,
    description: ''
  });

  const [resourceForm, setResourceForm] = useState({
    name: '',
    category: 'Audio/Visual',
    total_quantity: 50,
    available_quantity: 50,
    unit: 'units'
  });

  const [facultyForm, setFacultyForm] = useState({
    name: '',
    designation: 'Associate Professor',
    department: 'Computer Science and Engineering (CSE)',
    email: '',
    qualifications: 'Ph.D.'
  });

  const [departmentForm, setDepartmentForm] = useState({
    name: '',
    code: 'CSE',
    hod: '',
    faculty_count: 30
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [v, r, f, d, logs] = await Promise.all([
        fetchAdminVenues().catch(() => []),
        fetchAdminResources().catch(() => []),
        fetchAdminFaculty().catch(() => []),
        fetchAdminDepartments().catch(() => []),
        fetchAdminAuditLogs().catch(() => [])
      ]);
      setVenues(v);
      setResources(r);
      setFaculty(f);
      setDepartments(d);
      setAuditLogs(logs);
    } catch (e) {
      console.warn('Failed to load admin data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  // ----------------- VENUE ACTIONS -----------------
  const handleSaveVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateAdminVenue(editingItem.id, venueForm);
        triggerNotice(`Venue "${venueForm.name}" updated successfully.`);
      } else {
        await createAdminVenue(venueForm);
        triggerNotice(`Venue "${venueForm.name}" created successfully.`);
      }
      setModalType(null);
      setEditingItem(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteVenue = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete venue "${name}"?`)) return;
    try {
      await deleteAdminVenue(id);
      triggerNotice(`Venue "${name}" deleted.`);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ----------------- RESOURCE ACTIONS -----------------
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateAdminResource(editingItem.id, resourceForm);
        triggerNotice(`Resource "${resourceForm.name}" updated.`);
      } else {
        await createAdminResource(resourceForm);
        triggerNotice(`Resource "${resourceForm.name}" added to inventory.`);
      }
      setModalType(null);
      setEditingItem(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteResource = async (id: string, name: string) => {
    if (!window.confirm(`Delete resource "${name}" from inventory?`)) return;
    try {
      await deleteAdminResource(id);
      triggerNotice(`Resource "${name}" removed.`);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ----------------- FACULTY ACTIONS -----------------
  const handleSaveFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateAdminFaculty(editingItem.id, facultyForm);
        triggerNotice(`Faculty "${facultyForm.name}" updated.`);
      } else {
        await createAdminFaculty(facultyForm);
        triggerNotice(`Faculty "${facultyForm.name}" registered.`);
      }
      setModalType(null);
      setEditingItem(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteFaculty = async (id: string, name: string) => {
    if (!window.confirm(`Delete faculty coordinator "${name}"?`)) return;
    try {
      await deleteAdminFaculty(id);
      triggerNotice(`Faculty "${name}" removed.`);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ----------------- DEPARTMENT ACTIONS -----------------
  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminDepartment(departmentForm);
      triggerNotice(`Department "${departmentForm.name}" created.`);
      setModalType(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-8 border-b border-warm-200 dark:border-warm-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-warm-900 text-warm-50 dark:bg-warm-800 mb-2 border border-warm-700">
            <Shield className="w-3.5 h-3.5 text-blush-400" />
            <span>Super Admin Command Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-warm-950 dark:text-warm-50 tracking-tight">
            Master Data & Infrastructure Management
          </h1>
          <p className="text-xs sm:text-sm text-warm-600 dark:text-warm-400 mt-1 max-w-3xl">
            Full administrative CRUD control over Vignan University venues, equipment inventory, faculty coordinators, departments, and system activity logs.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-warm-900 border border-warm-200 dark:border-warm-800 text-warm-800 dark:text-warm-200 font-bold text-xs shadow-warm-sm hover:bg-warm-50 flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync Master Data</span>
        </button>
      </div>

      {/* Notice Message */}
      {noticeMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-sage-50 dark:bg-sage-950/60 border border-sage-200 dark:border-sage-800 text-sage-800 dark:text-sage-200 text-xs font-bold flex items-center gap-2 shadow-warm-sm">
          <Check className="w-4 h-4 text-sage-600" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-warm-200 dark:border-warm-800 pb-3 mb-6 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('venues')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'venues'
              ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 dark:text-warm-50 shadow-warm-sm'
              : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-blush-400" />
          Venues ({venues.length})
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'resources'
              ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 dark:text-warm-50 shadow-warm-sm'
              : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5 text-blush-400" />
          Resources ({resources.length})
        </button>

        <button
          onClick={() => setActiveTab('faculty')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'faculty'
              ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 dark:text-warm-50 shadow-warm-sm'
              : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-blush-400" />
          Faculty ({faculty.length})
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'departments'
              ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 dark:text-warm-50 shadow-warm-sm'
              : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800'
          }`}
        >
          <Building className="w-3.5 h-3.5 text-blush-400" />
          Departments ({departments.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-warm-900 text-warm-50 dark:bg-warm-700 dark:text-warm-50 shadow-warm-sm'
              : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-800'
          }`}
        >
          <History className="w-3.5 h-3.5 text-blush-400" />
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* ----------------- TAB 1: VENUES ----------------- */}
      {activeTab === 'venues' && (
        <div className="bg-white dark:bg-warm-900 rounded-3xl p-6 border border-warm-200 dark:border-warm-800 shadow-warm-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-warm-100 dark:border-warm-800">
            <div>
              <h3 className="font-extrabold text-base text-warm-950 dark:text-warm-50">Campus Venues Registry</h3>
              <p className="text-xs text-warm-500">Add, configure capacities, or delete university seminar halls and OATs</p>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setVenueForm({ name: '', category: 'Seminar Hall', block: 'Central Academic Block', capacity: 300, ac: true, av_equipped: true, description: '' });
                setModalType('venue');
              }}
              className="px-3.5 py-2 rounded-xl bg-warm-900 hover:bg-warm-800 dark:bg-warm-700 text-warm-50 font-bold text-xs shadow-warm-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Venue
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-warm-100 dark:border-warm-800 text-warm-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-2.5">Venue Name</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Block / Location</th>
                  <th className="pb-2.5">Capacity</th>
                  <th className="pb-2.5">AC / AV</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 dark:divide-warm-800/60">
                {venues.map((v) => (
                  <tr key={v.id} className="hover:bg-warm-50 dark:hover:bg-warm-850 transition">
                    <td className="py-3 pr-2 font-bold text-warm-900 dark:text-warm-100">{v.name}</td>
                    <td className="py-3 pr-2 font-medium text-warm-600 dark:text-warm-400">{v.category}</td>
                    <td className="py-3 pr-2 text-warm-500">{v.block}</td>
                    <td className="py-3 pr-2 font-extrabold text-warm-900 dark:text-warm-100">{v.capacity} seats</td>
                    <td className="py-3 pr-2 text-warm-600 dark:text-warm-400">
                      {v.ac ? 'AC' : 'Non-AC'} • {v.av_equipped ? 'AV Setup' : 'No AV'}
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(v);
                            setVenueForm({
                              name: v.name,
                              category: v.category,
                              block: v.block,
                              capacity: v.capacity,
                              ac: v.ac,
                              av_equipped: v.av_equipped,
                              description: v.description
                            });
                            setModalType('venue');
                          }}
                          className="p-1.5 rounded-lg text-warm-600 hover:text-warm-900 hover:bg-warm-100 dark:hover:bg-warm-800 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVenue(v.id, v.name)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: RESOURCES ----------------- */}
      {activeTab === 'resources' && (
        <div className="bg-white dark:bg-warm-900 rounded-3xl p-6 border border-warm-200 dark:border-warm-800 shadow-warm-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-warm-100 dark:border-warm-800">
            <div>
              <h3 className="font-extrabold text-base text-warm-950 dark:text-warm-50">Campus Resource Inventory</h3>
              <p className="text-xs text-warm-500">Track and update stock for projectors, microphones, Wi-Fi nodes, and seating</p>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setResourceForm({ name: '', category: 'Audio/Visual', total_quantity: 50, available_quantity: 50, unit: 'units' });
                setModalType('resource');
              }}
              className="px-3.5 py-2 rounded-xl bg-warm-900 hover:bg-warm-800 dark:bg-warm-700 text-warm-50 font-bold text-xs shadow-warm-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Resource
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-warm-100 dark:border-warm-800 text-warm-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-2.5">Resource Name</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Stock</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 dark:divide-warm-800/60">
                {resources.map((r) => (
                  <tr key={r.id} className="hover:bg-warm-50 dark:hover:bg-warm-850 transition">
                    <td className="py-3 pr-2 font-bold text-warm-900 dark:text-warm-100">{r.name}</td>
                    <td className="py-3 pr-2 text-warm-500">{r.category}</td>
                    <td className="py-3 pr-2 font-extrabold text-warm-900 dark:text-warm-100">
                      {r.available_quantity} / {r.total_quantity} {r.unit}
                    </td>
                    <td className="py-3 pr-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sage-50 text-sage-700 dark:bg-sage-950 dark:text-sage-300 border border-sage-200 dark:border-sage-800">
                        Operational
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(r);
                            setResourceForm({
                              name: r.name,
                              category: r.category,
                              total_quantity: r.total_quantity,
                              available_quantity: r.available_quantity,
                              unit: r.unit
                            });
                            setModalType('resource');
                          }}
                          className="p-1.5 rounded-lg text-warm-600 hover:text-warm-900 hover:bg-warm-100 dark:hover:bg-warm-800 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteResource(r.id, r.name)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- TAB 3: FACULTY ----------------- */}
      {activeTab === 'faculty' && (
        <div className="bg-white dark:bg-warm-900 rounded-3xl p-6 border border-warm-200 dark:border-warm-800 shadow-warm-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-warm-100 dark:border-warm-800">
            <div>
              <h3 className="font-extrabold text-base text-warm-950 dark:text-warm-50">Faculty Coordinators Directory</h3>
              <p className="text-xs text-warm-500">Manage department heads, mentor faculties, and event oversight officers</p>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setFacultyForm({ name: '', designation: 'Associate Professor', department: 'Computer Science and Engineering (CSE)', email: '', qualifications: 'Ph.D.' });
                setModalType('faculty');
              }}
              className="px-3.5 py-2 rounded-xl bg-warm-900 hover:bg-warm-800 dark:bg-warm-700 text-warm-50 font-bold text-xs shadow-warm-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Faculty
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-warm-100 dark:border-warm-800 text-warm-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-2.5">Faculty Name</th>
                  <th className="pb-2.5">Designation</th>
                  <th className="pb-2.5">Department</th>
                  <th className="pb-2.5">Email</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100 dark:divide-warm-800/60">
                {faculty.map((f) => (
                  <tr key={f.id} className="hover:bg-warm-50 dark:hover:bg-warm-850 transition">
                    <td className="py-3 pr-2 font-bold text-warm-900 dark:text-warm-100">{f.name}</td>
                    <td className="py-3 pr-2 text-warm-600 dark:text-warm-400">{f.designation}</td>
                    <td className="py-3 pr-2 text-warm-500">{f.department}</td>
                    <td className="py-3 pr-2 font-mono text-[11px] text-warm-500">{f.email}</td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(f);
                            setFacultyForm({
                              name: f.name,
                              designation: f.designation,
                              department: f.department,
                              email: f.email,
                              qualifications: f.qualifications || 'Ph.D.'
                            });
                            setModalType('faculty');
                          }}
                          className="p-1.5 rounded-lg text-warm-600 hover:text-warm-900 hover:bg-warm-100 dark:hover:bg-warm-800 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFaculty(f.id, f.name)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- TAB 4: DEPARTMENTS ----------------- */}
      {activeTab === 'departments' && (
        <div className="bg-white dark:bg-warm-900 rounded-3xl p-6 border border-warm-200 dark:border-warm-800 shadow-warm-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-warm-100 dark:border-warm-800">
            <div>
              <h3 className="font-extrabold text-base text-warm-950 dark:text-warm-50">Academic Departments</h3>
              <p className="text-xs text-warm-500">Registered engineering and management departments</p>
            </div>
            <button
              onClick={() => {
                setDepartmentForm({ name: '', code: 'CSE', hod: '', faculty_count: 25 });
                setModalType('department');
              }}
              className="px-3.5 py-2 rounded-xl bg-warm-900 hover:bg-warm-800 dark:bg-warm-700 text-warm-50 font-bold text-xs shadow-warm-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Department
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-2xl border border-warm-200 dark:border-warm-800 bg-warm-50/50 dark:bg-warm-950 flex items-start justify-between"
              >
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-warm-200 dark:bg-warm-800 text-warm-800 dark:text-warm-200">
                    {d.code}
                  </span>
                  <h4 className="font-extrabold text-sm text-warm-950 dark:text-warm-50 mt-1">{d.name}</h4>
                  <p className="text-xs text-warm-600 dark:text-warm-400 mt-0.5">HOD: {d.hod || 'Appointed'}</p>
                </div>
                <span className="text-xs font-extrabold text-warm-800 dark:text-warm-200">{d.faculty_count} Faculty</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- TAB 5: AUDIT LOGS ----------------- */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-warm-900 rounded-3xl p-6 border border-warm-200 dark:border-warm-800 shadow-warm-sm">
          <div className="mb-4 pb-3 border-b border-warm-100 dark:border-warm-800">
            <h3 className="font-extrabold text-base text-warm-950 dark:text-warm-50">Security Audit Logs & Telemetry</h3>
            <p className="text-xs text-warm-500">Immutable administrative record of all master data changes</p>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-warm-50 dark:bg-warm-950 border border-warm-200 dark:border-warm-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-warm-900 dark:text-warm-100">{log.action}</span>
                    <span className="text-[10px] text-warm-500 font-semibold">by {log.actor}</span>
                  </div>
                  <p className="text-[11px] text-warm-600 dark:text-warm-400">{log.details}</p>
                </div>
                <span className="text-[10px] font-mono text-warm-400 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- MODAL FOR VENUE ----------------- */}
      {modalType === 'venue' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-warm-900 rounded-3xl max-w-lg w-full p-6 border border-warm-200 dark:border-warm-800 shadow-warm-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-warm-100 dark:border-warm-800">
              <h3 className="font-extrabold text-base text-warm-950 dark:text-warm-50">
                {editingItem ? 'Edit Campus Venue' : 'Add New Campus Venue'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-warm-400 hover:text-warm-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVenue} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">Venue Name</label>
                <input
                  type="text"
                  required
                  value={venueForm.name}
                  onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-blush-400"
                  placeholder="e.g. Ramanujan Seminar Hall"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">Category</label>
                  <select
                    value={venueForm.category}
                    onChange={(e) => setVenueForm({ ...venueForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100"
                  >
                    <option value="Seminar Hall">Seminar Hall</option>
                    <option value="Open Air Theatre">Open Air Theatre</option>
                    <option value="Auditorium / Grand Hall">Auditorium / Grand Hall</option>
                    <option value="Informal / Student Hub">Informal / Student Hub</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">Capacity (Seats)</label>
                  <input
                    type="number"
                    required
                    min={20}
                    value={venueForm.capacity}
                    onChange={(e) => setVenueForm({ ...venueForm, capacity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">Campus Block</label>
                <input
                  type="text"
                  required
                  value={venueForm.block}
                  onChange={(e) => setVenueForm({ ...venueForm, block: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100"
                  placeholder="e.g. Central Academic Block"
                />
              </div>

              <div className="flex items-center gap-6 py-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-warm-700 dark:text-warm-300">
                  <input
                    type="checkbox"
                    checked={venueForm.ac}
                    onChange={(e) => setVenueForm({ ...venueForm, ac: e.target.checked })}
                    className="rounded border-warm-300 text-blush-600 focus:ring-blush-400"
                  />
                  <span>Central AC</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-warm-700 dark:text-warm-300">
                  <input
                    type="checkbox"
                    checked={venueForm.av_equipped}
                    onChange={(e) => setVenueForm({ ...venueForm, av_equipped: e.target.checked })}
                    className="rounded border-warm-300 text-blush-600 focus:ring-blush-400"
                  />
                  <span>AV Projection & Sound</span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-800 dark:text-warm-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-warm-900 hover:bg-warm-800 dark:bg-warm-700 text-warm-50 font-bold"
                >
                  Save Venue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL FOR RESOURCE ----------------- */}
      {modalType === 'resource' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-warm-900 rounded-3xl max-w-lg w-full p-6 border border-warm-200 dark:border-warm-800 shadow-warm-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-warm-100 dark:border-warm-800">
              <h3 className="font-extrabold text-base text-warm-950 dark:text-warm-50">
                {editingItem ? 'Edit Resource Stock' : 'Add New Resource'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-warm-400 hover:text-warm-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">Resource Name</label>
                <input
                  type="text"
                  required
                  value={resourceForm.name}
                  onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100"
                  placeholder="e.g. Wireless Microphones"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">Total Quantity</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={resourceForm.total_quantity}
                    onChange={(e) => setResourceForm({ ...resourceForm, total_quantity: Number(e.target.value), available_quantity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={resourceForm.unit}
                    onChange={(e) => setResourceForm({ ...resourceForm, unit: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100"
                    placeholder="units / sets / chairs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-800 dark:text-warm-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-warm-900 hover:bg-warm-800 dark:bg-warm-700 text-warm-50 font-bold"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- MODAL FOR FACULTY ----------------- */}
      {modalType === 'faculty' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-warm-900 rounded-3xl max-w-lg w-full p-6 border border-warm-200 dark:border-warm-800 shadow-warm-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-warm-100 dark:border-warm-800">
              <h3 className="font-extrabold text-base text-warm-950 dark:text-warm-50">
                {editingItem ? 'Edit Faculty Coordinator' : 'Register Faculty Coordinator'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-warm-400 hover:text-warm-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaculty} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100"
                  placeholder="e.g. Dr. Rajesh Kumar"
                />
              </div>

              <div>
                <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={facultyForm.department}
                  onChange={(e) => setFacultyForm({ ...facultyForm, department: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100"
                />
              </div>

              <div>
                <label className="block font-bold text-warm-700 dark:text-warm-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={facultyForm.email}
                  onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-warm-200 dark:border-warm-700 bg-warm-50 dark:bg-warm-950 text-warm-900 dark:text-warm-100"
                  placeholder="name@vignan.ac.in"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 py-2.5 rounded-xl bg-warm-100 dark:bg-warm-800 text-warm-800 dark:text-warm-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-warm-900 hover:bg-warm-800 dark:bg-warm-700 text-warm-50 font-bold"
                >
                  Save Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
