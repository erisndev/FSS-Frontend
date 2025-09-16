import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  Mail,
  Bell,
  Globe,
  Database,
  Server,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import DashboardLayout from "../../components/Layout/DashboardLayout";

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "TenderFlow",
    siteDescription: "Complete Tender Management System",
    maintenanceMode: false,
    registrationEnabled: true,

    // Email Settings
    emailProvider: "smtp",
    smtpHost: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    smtpSecure: true,

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,

    // Security Settings
    passwordMinLength: 6,
    requireEmailVerification: true,
    sessionTimeout: 24,
    maxLoginAttempts: 5,

    // File Upload Settings
    maxFileSize: 10,
    allowedFileTypes: "pdf,doc,docx,xls,xlsx,jpg,jpeg,png",

    // System Settings
    timezone: "UTC",
    dateFormat: "MM/dd/yyyy",
    currency: "USD",
    language: "en",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const handleInputChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save settings");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setLoading(true);
    try {
      // Simulate email test
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess("Test email sent successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to send test email");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "general", name: "General", icon: Settings },
    { id: "email", name: "Email", icon: Mail },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
    { id: "files", name: "File Upload", icon: Database },
    { id: "system", name: "System", icon: Server },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Site Name
        </label>
        <input
          type="text"
          value={settings.siteName}
          onChange={(e) => handleInputChange("siteName", e.target.value)}
          className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Site Description
        </label>
        <textarea
          value={settings.siteDescription}
          onChange={(e) => handleInputChange("siteDescription", e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) =>
                handleInputChange("maintenanceMode", e.target.checked)
              }
              className="w-5 h-5 text-cyan-400 bg-slate-800 border border-cyan-400/20 rounded focus:ring-cyan-400"
            />
            <span className="text-gray-300">Maintenance Mode</span>
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
          </label>
          <p className="text-gray-500 text-sm mt-1">
            Temporarily disable site access for maintenance
          </p>
        </div>

        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.registrationEnabled}
              onChange={(e) =>
                handleInputChange("registrationEnabled", e.target.checked)
              }
              className="w-5 h-5 text-cyan-400 bg-slate-800 border border-cyan-400/20 rounded focus:ring-cyan-400"
            />
            <span className="text-gray-300">Allow New Registrations</span>
          </label>
          <p className="text-gray-500 text-sm mt-1">
            Enable or disable new user registrations
          </p>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email Provider
        </label>
        <select
          value={settings.emailProvider}
          onChange={(e) => handleInputChange("emailProvider", e.target.value)}
          className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
        >
          <option value="smtp">SMTP</option>
          <option value="sendgrid">SendGrid</option>
          <option value="mailgun">Mailgun</option>
          <option value="ses">Amazon SES</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            SMTP Host
          </label>
          <input
            type="text"
            value={settings.smtpHost}
            onChange={(e) => handleInputChange("smtpHost", e.target.value)}
            placeholder="smtp.gmail.com"
            className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            SMTP Port
          </label>
          <input
            type="number"
            value={settings.smtpPort}
            onChange={(e) => handleInputChange("smtpPort", e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          SMTP Username
        </label>
        <input
          type="email"
          value={settings.smtpUsername}
          onChange={(e) => handleInputChange("smtpUsername", e.target.value)}
          placeholder="your-email@gmail.com"
          className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          SMTP Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={settings.smtpPassword}
            onChange={(e) => handleInputChange("smtpPassword", e.target.value)}
            className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors duration-200"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.smtpSecure}
            onChange={(e) => handleInputChange("smtpSecure", e.target.checked)}
            className="w-5 h-5 text-cyan-400 bg-slate-800 border border-cyan-400/20 rounded focus:ring-cyan-400"
          />
          <span className="text-gray-300">Use SSL/TLS</span>
        </label>
      </div>

      <div className="pt-4 border-t border-cyan-400/10">
        <button
          onClick={handleTestEmail}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 border border-purple-400/30 text-purple-400 rounded-lg hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          <Mail className="w-4 h-4" />
          <span>Send Test Email</span>
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) =>
              handleInputChange("emailNotifications", e.target.checked)
            }
            className="w-5 h-5 text-cyan-400 bg-slate-800 border border-cyan-400/20 rounded focus:ring-cyan-400"
          />
          <span className="text-gray-300">Email Notifications</span>
        </label>
        <p className="text-gray-500 text-sm mt-1">
          Send notifications via email
        </p>
      </div>

      <div>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.smsNotifications}
            onChange={(e) =>
              handleInputChange("smsNotifications", e.target.checked)
            }
            className="w-5 h-5 text-cyan-400 bg-slate-800 border border-cyan-400/20 rounded focus:ring-cyan-400"
          />
          <span className="text-gray-300">SMS Notifications</span>
        </label>
        <p className="text-gray-500 text-sm mt-1">
          Send notifications via SMS (requires SMS provider)
        </p>
      </div>

      <div>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.pushNotifications}
            onChange={(e) =>
              handleInputChange("pushNotifications", e.target.checked)
            }
            className="w-5 h-5 text-cyan-400 bg-slate-800 border border-cyan-400/20 rounded focus:ring-cyan-400"
          />
          <span className="text-gray-300">Push Notifications</span>
        </label>
        <p className="text-gray-500 text-sm mt-1">
          Send browser push notifications
        </p>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Minimum Password Length
        </label>
        <input
          type="number"
          value={settings.passwordMinLength}
          onChange={(e) =>
            handleInputChange("passwordMinLength", parseInt(e.target.value))
          }
          min="6"
          max="20"
          className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
        />
      </div>

      <div>
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.requireEmailVerification}
            onChange={(e) =>
              handleInputChange("requireEmailVerification", e.target.checked)
            }
            className="w-5 h-5 text-cyan-400 bg-slate-800 border border-cyan-400/20 rounded focus:ring-cyan-400"
          />
          <span className="text-gray-300">Require Email Verification</span>
        </label>
        <p className="text-gray-500 text-sm mt-1">
          Users must verify their email before accessing the system
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Session Timeout (hours)
        </label>
        <input
          type="number"
          value={settings.sessionTimeout}
          onChange={(e) =>
            handleInputChange("sessionTimeout", parseInt(e.target.value))
          }
          min="1"
          max="168"
          className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Max Login Attempts
        </label>
        <input
          type="number"
          value={settings.maxLoginAttempts}
          onChange={(e) =>
            handleInputChange("maxLoginAttempts", parseInt(e.target.value))
          }
          min="3"
          max="10"
          className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
        />
      </div>
    </div>
  );

  const renderFileSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Maximum File Size (MB)
        </label>
        <input
          type="number"
          value={settings.maxFileSize}
          onChange={(e) =>
            handleInputChange("maxFileSize", parseInt(e.target.value))
          }
          min="1"
          max="100"
          className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Allowed File Types
        </label>
        <input
          type="text"
          value={settings.allowedFileTypes}
          onChange={(e) =>
            handleInputChange("allowedFileTypes", e.target.value)
          }
          placeholder="pdf,doc,docx,xls,xlsx,jpg,jpeg,png"
          className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
        />
        <p className="text-gray-500 text-sm mt-1">
          Comma-separated list of allowed file extensions
        </p>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => handleInputChange("timezone", e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date Format
          </label>
          <select
            value={settings.dateFormat}
            onChange={(e) => handleInputChange("dateFormat", e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
          >
            <option value="MM/dd/yyyy">MM/DD/YYYY</option>
            <option value="dd/MM/yyyy">DD/MM/YYYY</option>
            <option value="yyyy-MM-dd">YYYY-MM-DD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Currency
          </label>
          <select
            value={settings.currency}
            onChange={(e) => handleInputChange("currency", e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="JPY">JPY - Japanese Yen</option>
            <option value="CAD">CAD - Canadian Dollar</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Language
          </label>
          <select
            value={settings.language}
            onChange={(e) => handleInputChange("language", e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralSettings();
      case "email":
        return renderEmailSettings();
      case "notifications":
        return renderNotificationSettings();
      case "security":
        return renderSecuritySettings();
      case "files":
        return renderFileSettings();
      case "system":
        return renderSystemSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <DashboardLayout
      title="System Settings"
      subtitle="Configure system-wide settings and preferences"
    >
      <div className="space-y-6">
        {/* Success/Error Messages */}
        {(success || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border flex items-center space-x-2 ${
              success
                ? "bg-green-500/20 border-green-400/50 text-green-300"
                : "bg-red-500/20 border-red-400/50 text-red-300"
            }`}
          >
            {success ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span>{success || error}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 text-cyan-400"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-cyan-400/20 rounded-xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-semibold text-white">
                  {tabs.find((tab) => tab.id === activeTab)?.name} Settings
                </h3>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{loading ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>

              {renderTabContent()}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemSettings;
