import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { createResourceEntry, listResources, removeResourceEntry, updateResourceEntry } from "../../api/resourceApi";

const INITIAL_FORM_STATE = {
	name: "",
	type: "LECTURE_HALL",
	capacity: "",
	location: "",
	availableFrom: "09:00",
	availableTo: "17:00",
	status: "ACTIVE"
};

const STATUS_STYLES = {
	ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-800",
	OUT_OF_SERVICE: "border-amber-200 bg-amber-50 text-amber-800",
	INACTIVE: "border-slate-200 bg-slate-100 text-slate-700"
};

const TYPE_LABELS = {
	LECTURE_HALL: "Lecture Hall",
	LAB: "Lab",
	MEETING_ROOM: "Meeting Room",
	EQUIPMENT: "Equipment"
};

function formatDateTime(value) {
	if (!value) {
		return "N/A";
	}

	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	}).format(new Date(value));
}

function formatTime(value) {
	if (!value) {
		return "N/A";
	}

	return value.length >= 5 ? value.slice(0, 5) : value;
}

function toTimeInputValue(value) {
	if (!value) {
		return "09:00";
	}

	return value.length >= 5 ? value.slice(0, 5) : value;
}

function ResourceList() {
	const [resources, setResources] = useState([]);
	const [loading, setLoading] = useState(true);
	const [query, setQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");
	const [typeFilter, setTypeFilter] = useState("ALL");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [resourceFormMode, setResourceFormMode] = useState("create");
	const [editingResourceId, setEditingResourceId] = useState(null);
	const [createSubmitting, setCreateSubmitting] = useState(false);
	const [createForm, setCreateForm] = useState(INITIAL_FORM_STATE);

	const loadResources = async () => {
		setLoading(true);
		try {
			const result = await listResources();
			setResources(Array.isArray(result) ? result : []);
		} catch (error) {
			toast.error(error?.response?.data?.message || error?.message || "Unable to load resources");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadResources();
	}, []);

	const resourceTypes = useMemo(
		() => ["ALL", ...new Set(resources.map((resource) => resource.type).filter(Boolean))],
		[resources]
	);

	const visibleResources = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return resources.filter((resource) => {
			const matchesQuery =
				normalizedQuery.length === 0 ||
				[resource.name, resource.location, resource.capacity, resource.type, resource.status]
					.filter(Boolean)
					.some((value) => String(value).toLowerCase().includes(normalizedQuery));

			const matchesStatus = statusFilter === "ALL" || resource.status === statusFilter;
			const matchesType = typeFilter === "ALL" || resource.type === typeFilter;

			return matchesQuery && matchesStatus && matchesType;
		});
	}, [resources, query, statusFilter, typeFilter]);

	const activeCount = resources.filter((resource) => resource.status === "ACTIVE").length;

	const handleCreateFormChange = (event) => {
		const { name, value } = event.target;
		setCreateForm((currentForm) => ({
			...currentForm,
			[name]: value
		}));
	};

	const resetCreateForm = () => {
		setCreateForm(INITIAL_FORM_STATE);
	};

	const openCreateModal = () => {
		setResourceFormMode("create");
		setEditingResourceId(null);
		resetCreateForm();
		setIsCreateModalOpen(true);
	};

	const openEditModal = (resource) => {
		setResourceFormMode("edit");
		setEditingResourceId(resource.id);
		setCreateForm({
			name: resource.name || "",
			type: resource.type || "LECTURE_HALL",
			capacity: resource.capacity?.toString() || "",
			location: resource.location || "",
			availableFrom: toTimeInputValue(resource.availableFrom),
			availableTo: toTimeInputValue(resource.availableTo),
			status: resource.status || "ACTIVE"
		});
		setIsCreateModalOpen(true);
	};

	const closeCreateModal = () => {
		if (createSubmitting) {
			return;
		}

		setEditingResourceId(null);
		setResourceFormMode("create");
		setIsCreateModalOpen(false);
	};

	const handleCreateResource = async (event) => {
		event.preventDefault();
		setCreateSubmitting(true);

		try {
			const payload = {
				name: createForm.name.trim(),
				type: createForm.type,
				capacity: Number(createForm.capacity),
				location: createForm.location.trim(),
				availableFrom: createForm.availableFrom,
				availableTo: createForm.availableTo,
				status: createForm.status
			};

			if (resourceFormMode === "edit" && editingResourceId) {
				await updateResourceEntry(editingResourceId, payload);
				toast.success("Resource updated successfully");
			} else {
				await createResourceEntry(payload);
				toast.success("Resource created successfully");
			}

			setIsCreateModalOpen(false);
			setResourceFormMode("create");
			setEditingResourceId(null);
			resetCreateForm();
			await loadResources();
		} catch (error) {
			toast.error(error?.response?.data?.message || error?.message || "Unable to save resource");
		} finally {
			setCreateSubmitting(false);
		}
	};

	const handleDeleteResource = async (resource) => {
		const confirmed = window.confirm(`Delete ${resource.name}? This will permanently remove the resource.`);

		if (!confirmed) {
			return;
		}

		try {
			await removeResourceEntry(resource.id);
			toast.success("Resource permanently deleted");
			await loadResources();
		} catch (error) {
			toast.error(error?.response?.data?.message || error?.message || "Unable to delete resource");
		}
	};

	return (
		<section className="flex min-h-full flex-1 flex-col gap-6 bg-slate-50 p-6 lg:p-8">
			<div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">Admin dashboard</p>
						<h1 className="mt-2 text-3xl font-semibold text-slate-900">Resources</h1>
						<p className="mt-2 max-w-2xl text-sm text-slate-500">
							Browse the current campus resource catalog, track status, and review availability details.
						</p>
					</div>

					<div className="flex flex-col gap-3 sm:flex-row">
						<button
							type="button"
							onClick={openCreateModal}
							className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
						>
							<span className="material-symbols-outlined text-[18px]">add</span>
							Add Resource
						</button>

						<button
							type="button"
							onClick={loadResources}
							className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
						>
							<span className="material-symbols-outlined text-[18px]">refresh</span>
							Refresh
						</button>
					</div>
				</div>

				<div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
						<p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Total resources</p>
						<p className="mt-2 text-3xl font-semibold text-slate-900">{resources.length}</p>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
						<p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Active resources</p>
						<p className="mt-2 text-3xl font-semibold text-emerald-600">{activeCount}</p>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
						<p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Filtered view</p>
						<p className="mt-2 text-3xl font-semibold text-slate-900">{visibleResources.length}</p>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
						<p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Status filter</p>
						<p className="mt-2 text-3xl font-semibold text-slate-900">{statusFilter}</p>
					</div>
				</div>

				<div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_repeat(2,minmax(0,1fr))]">
					<label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
						<span className="material-symbols-outlined text-slate-400">search</span>
						<input
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search by name, location, type, or status"
							className="w-full border-0 bg-transparent p-0 text-sm text-slate-900 outline-none placeholder:text-slate-400"
						/>
					</label>

					<select
						value={typeFilter}
						onChange={(event) => setTypeFilter(event.target.value)}
						className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none"
					>
						{resourceTypes.map((type) => (
							<option key={type} value={type}>
								{type === "ALL" ? "All types" : TYPE_LABELS[type] || type}
							</option>
						))}
					</select>

					<select
						value={statusFilter}
						onChange={(event) => setStatusFilter(event.target.value)}
						className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none"
					>
						<option value="ALL">All statuses</option>
						<option value="ACTIVE">Active</option>
						<option value="OUT_OF_SERVICE">Out of service</option>
						<option value="INACTIVE">Inactive</option>
					</select>
				</div>
			</div>

			<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
				<div className="border-b border-slate-200 px-6 py-4">
					<h2 className="text-lg font-semibold text-slate-900">Resource catalog</h2>
					<p className="text-sm text-slate-500">A live list of resources available in the system.</p>
				</div>

				{loading ? (
					<div className="flex items-center justify-center px-6 py-16 text-sm text-slate-500">Loading resources...</div>
				) : visibleResources.length === 0 ? (
					<div className="px-6 py-16 text-center">
						<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
							<span className="material-symbols-outlined">database_search</span>
						</div>
						<h3 className="mt-4 text-lg font-semibold text-slate-900">No resources found</h3>
						<p className="mt-2 text-sm text-slate-500">Try adjusting your search or filters, then refresh the list.</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-slate-200">
							<thead className="bg-slate-50">
								<tr>
									<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
										Resource
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
										Type
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
										Location
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
										Capacity
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
										Availability
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
										Status
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
										Updated
									</th>
									<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100 bg-white">
								{visibleResources.map((resource) => (
									<tr key={resource.id} className="transition hover:bg-slate-50/80">
										<td className="px-6 py-5">
											<div className="font-semibold text-slate-900">{resource.name}</div>
											<div className="text-sm text-slate-500">ID: {resource.id}</div>
										</td>
										<td className="px-6 py-5 text-sm text-slate-700">{TYPE_LABELS[resource.type] || resource.type}</td>
										<td className="px-6 py-5 text-sm text-slate-700">{resource.location || "N/A"}</td>
										<td className="px-6 py-5 text-sm text-slate-700">{resource.capacity ?? "N/A"}</td>
										<td className="px-6 py-5 text-sm text-slate-700">
											{formatTime(resource.availableFrom)} - {formatTime(resource.availableTo)}
										</td>
										<td className="px-6 py-5">
											<span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[resource.status] || STATUS_STYLES.INACTIVE}`}>
												{resource.status?.replaceAll("_", " ") || "UNKNOWN"}
											</span>
										</td>
										<td className="px-6 py-5 text-sm text-slate-500">{formatDateTime(resource.updatedAt)}</td>
										<td className="px-6 py-5">
											<div className="flex flex-wrap gap-2">
												<button
													type="button"
													onClick={() => openEditModal(resource)}
													className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
												>
													<span className="material-symbols-outlined text-[16px]">edit</span>
													Edit
												</button>
												<button
													type="button"
													onClick={() => handleDeleteResource(resource)}
													className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
												>
													<span className="material-symbols-outlined text-[16px]">delete</span>
													Delete
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{isCreateModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
					<div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-[0_24px_90px_rgba(15,23,42,0.3)]">
						<div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Create resource</p>
								<h3 className="mt-2 text-2xl font-semibold text-slate-900">
									{resourceFormMode === "edit" ? "Edit Resource" : "Add Resource"}
								</h3>
								<p className="mt-1 text-sm text-slate-500">Fill in the details below to add a new campus resource.</p>
							</div>
							<button
								type="button"
								onClick={closeCreateModal}
								className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
								aria-label="Close add resource dialog"
							>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>

						<form onSubmit={handleCreateResource} className="grid gap-5 p-6">
							<div className="grid gap-4 md:grid-cols-2">
								<label className="grid gap-2 text-sm font-medium text-slate-700">
									<span>Resource name</span>
									<input
										type="text"
										name="name"
										value={createForm.name}
										onChange={handleCreateFormChange}
										required
										placeholder="Example: Lecture Hall A1"
										className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
									/>
								</label>

								<label className="grid gap-2 text-sm font-medium text-slate-700">
									<span>Type</span>
									<select
										name="type"
										value={createForm.type}
										onChange={handleCreateFormChange}
										className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
									>
										{Object.entries(TYPE_LABELS).map(([value, label]) => (
											<option key={value} value={value}>
												{label}
											</option>
										))}
									</select>
								</label>

								<label className="grid gap-2 text-sm font-medium text-slate-700">
									<span>Capacity</span>
									<input
										type="number"
										name="capacity"
										min="0"
										value={createForm.capacity}
										onChange={handleCreateFormChange}
										required
										placeholder="50"
										className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
									/>
								</label>

								<label className="grid gap-2 text-sm font-medium text-slate-700">
									<span>Location</span>
									<input
										type="text"
										name="location"
										value={createForm.location}
										onChange={handleCreateFormChange}
										required
										placeholder="Main building, floor 2"
										className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
									/>
								</label>

								<label className="grid gap-2 text-sm font-medium text-slate-700">
									<span>Available from</span>
									<input
										type="time"
										name="availableFrom"
										value={createForm.availableFrom}
										onChange={handleCreateFormChange}
										required
										className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
									/>
								</label>

								<label className="grid gap-2 text-sm font-medium text-slate-700">
									<span>Available to</span>
									<input
										type="time"
										name="availableTo"
										value={createForm.availableTo}
										onChange={handleCreateFormChange}
										required
										className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
									/>
								</label>

								<label className="grid gap-2 text-sm font-medium text-slate-700">
									<span>Status</span>
									<select
										name="status"
										value={createForm.status}
										onChange={handleCreateFormChange}
										className="rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
									>
										<option value="ACTIVE">Active</option>
										<option value="OUT_OF_SERVICE">Out of service</option>
										<option value="INACTIVE">Inactive</option>
									</select>
								</label>
							</div>

							<div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
								<button
									type="button"
									onClick={closeCreateModal}
									disabled={createSubmitting}
									className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={createSubmitting}
									className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{createSubmitting ? (resourceFormMode === "edit" ? "Saving..." : "Creating...") : resourceFormMode === "edit" ? "Save Changes" : "Create Resource"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</section>
	);
}

export default ResourceList;
