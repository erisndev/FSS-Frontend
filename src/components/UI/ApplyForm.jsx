import React from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Calendar,
  Upload,
  FileText,
  X,
  AlertCircle,
} from "lucide-react";

const ApplyForm = ({
  formData,
  onInputChange,
  onFileUpload,
  onRemoveFile,
  onSubmit,
  onCancel,
  loading,
  error,
  formatFileSize
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-4 bg-red-500/20 border border-red-400/30 text-red-300 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* Company Information Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-6"
      >
        <h4 className="text-lg font-semibold text-cyan-400 mb-4">Company Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Company Name *</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={onInputChange}
              required
              className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
              placeholder="Your company or business name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Registration Number</label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={onInputChange}
              className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
              placeholder="Company registration number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">B-BBEE Level</label>
            <select
              name="bbeeLevel"
              value={formData.bbeeLevel}
              onChange={onInputChange}
              className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
            >
              <option value="">Select B-BBEE Level</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(level => (
                <option key={level} value={level}>Level {level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">CIDB Grading</label>
            <select
              name="cidbGrading"
              value={formData.cidbGrading}
              onChange={onInputChange}
              className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
            >
              <option value="">Select CIDB Grading</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(grade => (
                <option key={grade} value={`${grade}GB`}>{grade}GB</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Contact Information Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-6"
      >
        <h4 className="text-lg font-semibold text-cyan-400 mb-4">Contact Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contact Person *</label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={onInputChange}
              required
              className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
              placeholder="Full name of contact person"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onInputChange}
              required
              className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
              placeholder="your.email@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onInputChange}
              required
              className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
              placeholder="+27 12 345 6789"
            />
          </div>
        </div>
      </motion.div>

      {/* Bid Details Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-6"
      >
        <h4 className="text-lg font-semibold text-cyan-400 mb-4">Bid Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Proposed Amount *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400" />
              <input
                type="number"
                name="bidAmount"
                value={formData.bidAmount}
                onChange={onInputChange}
                required
                min="0"
                step="0.01"
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                placeholder="Enter your bid amount"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Estimated Timeframe</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
              <input
                type="text"
                name="timeframe"
                value={formData.timeframe}
                onChange={onInputChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                placeholder="e.g., 3 months, 6 weeks"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cover Letter Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-6"
      >
        <h4 className="text-lg font-semibold text-cyan-400 mb-4">Cover Letter</h4>
        <textarea
          name="message"
          value={formData.message}
          onChange={onInputChange}
          required
          rows={6}
          className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300 resize-none"
          placeholder="Explain why you're the best fit for this tender. Include your relevant experience, qualifications, and what makes your proposal unique..."
        />
      </motion.div>

      {/* Supporting Documents Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-6"
      >
        <h4 className="text-lg font-semibold text-cyan-400 mb-4">Supporting Documents</h4>
        <div className="border-2 border-dashed border-cyan-400/20 rounded-lg p-6 hover:border-cyan-400/40 transition-all duration-300">
          <div className="text-center">
            <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <p className="text-gray-300 mb-2">Drop files here or click to upload</p>
            <p className="text-gray-500 text-sm mb-4">Upload certificates, portfolio, company profile, etc.</p>
            <p className="text-gray-500 text-xs mb-4">Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB each)</p>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={onFileUpload}
              className="hidden"
              id="apply-file-upload"
            />
            <label
              htmlFor="apply-file-upload"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-cyan-500/20 border border-cyan-400/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 cursor-pointer transition-all duration-300"
            >
              <Upload className="w-4 h-4" />
              <span>Choose Files</span>
            </label>
          </div>
        </div>

        {formData.files?.length > 0 && (
          <div className="mt-6 space-y-3">
            <h5 className="text-white font-medium">Uploaded Documents ({formData.files.length})</h5>
            {formData.files.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-slate-800/50 border border-cyan-400/10 rounded-lg hover:bg-slate-800/70 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{doc.name}</p>
                    {doc.size && <p className="text-gray-400 text-xs">{formatFileSize(doc.size)}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFile(doc.id)}
                  className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Submit Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-between pt-6 border-t border-cyan-400/10"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className={`px-6 py-3 bg-slate-800/50 border border-gray-400/20 text-gray-300 rounded-lg transition-all duration-300 ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-800/70"
          }`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Submitting Application...</span>
            </div>
          ) : (
            "Submit Application"
          )}
        </button>
      </motion.div>
    </form>
  );
};

export default ApplyForm;