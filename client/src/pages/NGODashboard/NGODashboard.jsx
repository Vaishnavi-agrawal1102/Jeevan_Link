
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient.js";

const NGODashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [shelters, setShelters] = useState([]);
  const [resources, setResources] = useState([]);
  const [requests, setRequests] = useState([]);

  const [announcement, setAnnouncement] = useState({
    title: "",
    body: "",
  });

  const [responseForms, setResponseForms] = useState({});
  const [posting, setPosting] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [updatingRequest, setUpdatingRequest] = useState(null);

  const load = async () => {
    setLoadingRequests(true);

    try {
      const results = await Promise.allSettled([
        apiClient.get("/shelter/all", {
          params: { district: user?.district },
        }),
        apiClient.get("/resource/all", {
          params: { district: user?.district },
        }),
        apiClient.get("/ngo/requests"),
      ]);

      if (results[0].status === "fulfilled") {
        setShelters(results[0].value.data.shelters || []);
      } else {
        toast.error("Could not load relief camps");
      }

      if (results[1].status === "fulfilled") {
        setResources(results[1].value.data.resources || []);
      } else {
        toast.error("Could not load resource stock");
      }

      if (results[2].status === "fulfilled") {
        const requestList = results[2].value.data.requests || [];

        setRequests(requestList);

        const forms = {};

        requestList.forEach((request) => {
          const response = request.ngoResponse || {};

          forms[request._id] = {
            responseEtaMinutes: response.responseEtaMinutes ?? "",
            teamDispatched: response.teamDispatched ?? false,
            foodDelivered: response.foodDelivered ?? false,
            waterDelivered: response.waterDelivered ?? false,
            medicalAssistance:
              response.medicalAssistance || "not_started",
            rescueStatus: response.rescueStatus || "not_started",
            latestUpdate: response.latestUpdate || "",
          };
        });

        setResponseForms(forms);
      } else {
        toast.error(
          results[2].reason?.response?.data?.message ||
            "Could not load emergency requests"
        );
      }
    } catch (err) {
      toast.error("Could not load dashboard data");
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();

    if (!announcement.title.trim() || !announcement.body.trim()) {
      toast.error("Please enter both title and message");
      return;
    }

    setPosting(true);

    try {
      await apiClient.post("/ngo/announcement", {
        ...announcement,
        district: user?.district,
      });

      toast.success("Announcement posted");
      setAnnouncement({ title: "", body: "" });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Could not post announcement"
      );
    } finally {
      setPosting(false);
    }
  };

  const updateResponseForm = (requestId, field, value) => {
    setResponseForms((previous) => ({
      ...previous,
      [requestId]: {
        ...previous[requestId],
        [field]: value,
      },
    }));
  };

  const handleAcceptRequest = async (request) => {
    setUpdatingRequest(request._id);

    try {
      await apiClient.put(`/ngo/requests/${request._id}`, {
  status: "accepted",
});

      toast.success("Emergency request accepted");
      await load();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Could not accept this request"
      );
    } finally {
      setUpdatingRequest(null);
    }
  };

  const handleSaveResponse = async (request) => {
    const form = responseForms[request._id];

    if (!form) return;

    const updateData = {
      teamDispatched: form.teamDispatched,
      foodDelivered: form.foodDelivered,
      waterDelivered: form.waterDelivered,
      medicalAssistance: form.medicalAssistance,
      rescueStatus: form.rescueStatus,
      latestUpdate: form.latestUpdate,
    };

    if (form.responseEtaMinutes !== "") {
      const eta = Number(form.responseEtaMinutes);

      if (!Number.isFinite(eta) || eta < 0) {
        toast.error("Please enter a valid NGO response ETA");
        return;
      }

      updateData.responseEtaMinutes = eta;
    }

    setUpdatingRequest(request._id);

    try {
      await apiClient.put(
        `/ngo/requests/${request._id}`,
        updateData
      );

      toast.success("NGO response progress updated");
      await load();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Could not update response progress"
      );
    } finally {
      setUpdatingRequest(null);
    }
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "Not available";
    }

    return String(value)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const isAssignedToThisNGO = (request) => {
    const assignedNGO = request.ngo?._id || request.ngo;
    const currentUserId = user?._id || user?.id;

    return (
      assignedNGO &&
      currentUserId &&
      String(assignedNGO) === String(currentUserId)
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl font-semibold text-river-900">
        {user?.organizationName || user?.name}
      </h1>

      <p className="mt-1 text-sm text-ink/60">
        Relief camps, resources and emergency response in{" "}
        {user?.district || user?.state || "your region"}.
      </p>

      {/* ANNOUNCEMENTS */}

      <form
        onSubmit={handlePostAnnouncement}
        className="card mt-8 space-y-3"
      >
        <h2 className="font-display text-lg font-semibold text-river-900">
          Post an announcement
        </h2>

        <input
          className="input"
          placeholder="Title"
          value={announcement.title}
          onChange={(e) =>
            setAnnouncement({
              ...announcement,
              title: e.target.value,
            })
          }
        />

        <textarea
          className="input"
          rows={2}
          placeholder="Message to residents in your district..."
          value={announcement.body}
          onChange={(e) =>
            setAnnouncement({
              ...announcement,
              body: e.target.value,
            })
          }
        />

        <button
          type="submit"
          disabled={posting}
          className="btn-primary"
        >
          {posting ? "Posting..." : "Post to district"}
        </button>
      </form>

      {/* EMERGENCY REQUESTS */}

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-river-900">
              Emergency requests
            </h2>

            <p className="mt-1 text-sm text-ink/60">
              Review incoming requests and manage your NGO response.
            </p>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={loadingRequests}
            className="btn-secondary"
          >
            {loadingRequests ? "Refreshing..." : "Refresh requests"}
          </button>
        </div>

        {loadingRequests && requests.length === 0 && (
          <p className="mt-4 text-sm text-ink/50">
            Loading emergency requests...
          </p>
        )}

        {!loadingRequests && requests.length === 0 && (
          <p className="mt-4 rounded-xl border border-river-100 p-5 text-sm text-ink/50">
            No emergency requests found in your region.
          </p>
        )}

        <div className="mt-5 space-y-6">
          {requests.map((request) => {
            const form = responseForms[request._id] || {};
            const assignedToMe = isAssignedToThisNGO(request);
            const alreadyAssigned = Boolean(request.ngo);
            const predictions = request.mlPredictions || {};

            return (
              <article key={request._id} className="card space-y-5">
                {/* REQUEST DETAILS */}

                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-river-900">
                      {formatValue(request.type)} Emergency
                    </h3>

                    <p className="mt-1 text-xs text-ink/50">
                      Request ID: {request._id}
                    </p>
                  </div>

                  <span className="rounded-full bg-river-100 px-3 py-1 text-xs font-semibold capitalize text-river-800">
                    {formatValue(request.status)}
                  </span>
                </div>

                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <p>
                    <strong>User-reported urgency:</strong>{" "}
                    {formatValue(request.urgency)}
                  </p>

                  <p>
                    <strong>People affected:</strong>{" "}
                    {request.numberOfPeople ?? "Not available"}
                  </p>

                  <p>
                    <strong>State:</strong>{" "}
                    {request.state || "Not available"}
                  </p>

                  <p>
                    <strong>District:</strong>{" "}
                    {request.district || "Not available"}
                  </p>

                  <p>
                    <strong>Reporter:</strong>{" "}
                    {request.reporterName ||
                      request.victim?.name ||
                      "Anonymous"}
                  </p>

                  <p>
                    <strong>Address:</strong>{" "}
                    {request.address || "Not available"}
                  </p>
                </div>

                {request.description && (
                  <div>
                    <p className="text-sm font-semibold text-river-900">
                      Description
                    </p>

                    <p className="mt-1 text-sm text-ink/70">
                      {request.description}
                    </p>
                  </div>
                )}

                {/* ML PREDICTIONS */}

                <div className="rounded-xl bg-river-50 p-4">
                  <h4 className="font-semibold text-river-900">
                    ML predictions
                  </h4>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-ink/50">
                        ML-predicted urgency
                      </p>

                      <p className="mt-1 font-semibold capitalize text-river-900">
                        {formatValue(predictions.urgency)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-ink/50">
                        ML-predicted travel ETA
                      </p>

                      <p className="mt-1 font-semibold text-river-900">
                        {predictions.etaMinutes != null
                          ? `${Number(predictions.etaMinutes).toFixed(1)} minutes`
                          : "Not available"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold text-ink/60">
                      ML assistance recommendations
                    </p>

                    {predictions.assistance?.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {predictions.assistance.map((item, index) => (
                          <span
                            key={`${item}-${index}`}
                            className="rounded-full bg-white px-3 py-1 text-xs capitalize text-river-800"
                          >
                            {formatValue(item)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-ink/50">
                        No assistance recommendations available.
                      </p>
                    )}
                  </div>

                  <p className="mt-3 text-xs text-ink/50">
                    ML predictions are estimates. Review them alongside
                    the reported emergency details.
                  </p>
                </div>

                {/* ACCEPT REQUEST */}

                {!alreadyAssigned && request.status === "pending" && (
                  <button
                    type="button"
                    disabled={updatingRequest === request._id}
                    onClick={() => handleAcceptRequest(request)}
                    className="btn-primary"
                  >
                    {updatingRequest === request._id
                      ? "Accepting..."
                      : "Accept emergency request"}
                  </button>
                )}

                {alreadyAssigned && (
                  <p className="text-sm font-medium text-river-800">
                    {assignedToMe
                      ? "This request is assigned to your NGO."
                      : `Assigned NGO: ${
                          request.ngo?.organizationName ||
                          request.ngo?.name ||
                          "Another organization"
                        }`}
                  </p>
                )}

                {/* NGO RESPONSE MANAGEMENT */}

                {assignedToMe && (
                  <div className="space-y-4 border-t border-river-100 pt-5">
                    <div>
                      <h4 className="font-semibold text-river-900">
                        NGO response management
                      </h4>

                      <p className="mt-1 text-xs text-ink/50">
                        Record your organization's response progress.
                      </p>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        NGO response ETA (minutes)
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="input"
                        placeholder="Enter your estimated response time"
                        value={form.responseEtaMinutes ?? ""}
                        onChange={(e) =>
                          updateResponseForm(
                            request._id,
                            "responseEtaMinutes",
                            e.target.value
                          )
                        }
                      />

                      <p className="mt-1 text-xs text-ink/50">
                        This is your NGO's estimate, separate from the
                        ML-predicted ETA.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={Boolean(form.teamDispatched)}
                          onChange={(e) =>
                            updateResponseForm(
                              request._id,
                              "teamDispatched",
                              e.target.checked
                            )
                          }
                        />
                        Team dispatched
                      </label>

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={Boolean(form.foodDelivered)}
                          onChange={(e) =>
                            updateResponseForm(
                              request._id,
                              "foodDelivered",
                              e.target.checked
                            )
                          }
                        />
                        Food delivered
                      </label>

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={Boolean(form.waterDelivered)}
                          onChange={(e) =>
                            updateResponseForm(
                              request._id,
                              "waterDelivered",
                              e.target.checked
                            )
                          }
                        />
                        Water delivered
                      </label>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Medical assistance
                      </label>

                      <select
                        className="input"
                        value={form.medicalAssistance || "not_started"}
                        onChange={(e) =>
                          updateResponseForm(
                            request._id,
                            "medicalAssistance",
                            e.target.value
                          )
                        }
                      >
                        <option value="not_started">Not started</option>
                        <option value="in_progress">In progress</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Rescue status
                      </label>

                      <select
                        className="input"
                        value={form.rescueStatus || "not_started"}
                        onChange={(e) =>
                          updateResponseForm(
                            request._id,
                            "rescueStatus",
                            e.target.value
                          )
                        }
                      >
                        <option value="not_started">Not started</option>
                        <option value="in_progress">In progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Latest response update
                      </label>

                      <textarea
                        className="input"
                        rows={3}
                        maxLength={500}
                        placeholder="Write an update for the affected person..."
                        value={form.latestUpdate || ""}
                        onChange={(e) =>
                          updateResponseForm(
                            request._id,
                            "latestUpdate",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <button
                      type="button"
                      disabled={updatingRequest === request._id}
                      onClick={() => handleSaveResponse(request)}
                      className="btn-primary"
                    >
                      {updatingRequest === request._id
                        ? "Saving..."
                        : "Save response progress"}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* RELIEF CAMPS AND RESOURCES */}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-lg font-semibold text-river-900">
            Relief camps
          </h2>

          {shelters.length === 0 && (
            <p className="mt-3 text-sm text-ink/50">
              No camps registered yet.
            </p>
          )}

          <ul className="mt-4 space-y-3">
            {shelters.map((s) => {
              const rate = s.capacity
                ? Math.round(
                    (s.currentOccupancy / s.capacity) * 100
                  )
                : 0;

              return (
                <li key={s._id} className="card">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-river-900">
                      {s.name}
                    </span>

                    <span className="font-mono text-xs text-ink/50">
                      {s.currentOccupancy}/{s.capacity}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-ink/50">
                    {s.address}
                  </p>

                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-river-100">
                    <div
                      className="h-full bg-river-600"
                      style={{
                        width: `${Math.min(rate, 100)}%`,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-river-900">
            Resource stock
          </h2>

          {resources.length === 0 && (
            <p className="mt-3 text-sm text-ink/50">
              No resources logged yet.
            </p>
          )}

          <ul className="mt-4 space-y-3">
            {resources.map((r) => (
              <li
                key={r._id}
                className="card flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-river-900">
                    {r.name}
                  </p>

                  <p className="text-xs capitalize text-ink/50">
                    {r.category}
                  </p>
                </div>

                <span className="font-mono text-sm text-river-800">
                  {r.quantity} {r.unit}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default NGODashboard;

