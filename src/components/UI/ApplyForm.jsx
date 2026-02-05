import React from "react";
import { motion } from "framer-motion";
import { Calendar, Upload, FileText, X, AlertCircle } from "lucide-react";

const ApplyForm = ({
  formData,
  onInputChange,
  onFileUpload,
  onRemoveFile,
  onSubmit,
  onCancel,
  loading,
  error,
  formatFileSize,
  onFileDrop,
}) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  return (
    <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
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
          className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-4"
        >
          <h4 className="text-base font-semibold text-cyan-400 mb-3">
            Company Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company Name *
              </label>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Registration Number
              </label>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                B-BBEE Level
              </label>
              <select
                name="bbeeLevel"
                value={formData.bbeeLevel}
                onChange={onInputChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
              >
                <option value="">Select B-BBEE Level</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((level) => (
                  <option key={level} value={level}>
                    Level {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CIDB Grading
              </label>
              <input
                type="text"
                name="cidbGrading"
                value={formData.cidbGrading}
                onChange={onInputChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400/50 focus:bg-slate-800/70 transition-all duration-300"
                placeholder="e.g., 5GB, 7CE"
              />
            </div>
          </div>
        </motion.div>

        {/* Contact Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-4"
        >
          <h4 className="text-base font-semibold text-cyan-400 mb-3">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contact Person *
              </label>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address *
              </label>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number *
              </label>
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
          className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-4"
        >
          <h4 className="text-base font-semibold text-cyan-400 mb-3">
            Bid Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Proposed Amount *
              </label>
              <div className="relative">
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estimated Timeframe
              </label>
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
          className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-4"
        >
          <h4 className="text-base font-semibold text-cyan-400 mb-3">
            Cover Letter
          </h4>
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

        {/* Documents Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800/30 border border-cyan-400/10 rounded-lg p-4"
        >
          <h4 className="text-base font-semibold text-cyan-400 mb-4">
            Documents
          </h4>
          <div className="space-y-4">
            {/* Bid File Documents */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bid File Documents
              </label>
              {formData.bidFileDocuments ? (
                <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-cyan-400/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white text-sm font-medium">
                        {formData.bidFileDocuments.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatFileSize(formData.bidFileDocuments.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveFile('bidFileDocuments')}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    id="bidFileDocuments"
                    onChange={(e) => onFileUpload(e, 'bidFileDocuments')}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                  <label
                    htmlFor="bidFileDocuments"
                    onDrop={(e) => onFileDrop(e, 'bidFileDocuments')}
                    onDragOver={handleDragOver}
                    className="flex items-center justify-center px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-gray-400 hover:text-white hover:border-cyan-400/40 cursor-pointer transition-all duration-200"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    <span className="text-sm">Choose File or Drop Here</span>
                  </label>
                </div>
              )}
            </div>

            {/* Compiled Documents */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Compiled Documents
              </label>
              {formData.compiledDocuments ? (
                <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-cyan-400/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white text-sm font-medium">
                        {formData.compiledDocuments.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatFileSize(formData.compiledDocuments.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveFile('compiledDocuments')}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    id="compiledDocuments"
                    onChange={(e) => onFileUpload(e, 'compiledDocuments')}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                  <label
                    htmlFor="compiledDocuments"
                    onDrop={(e) => onFileDrop(e, 'compiledDocuments')}
                    onDragOver={handleDragOver}
                    className="flex items-center justify-center px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-gray-400 hover:text-white hover:border-cyan-400/40 cursor-pointer transition-all duration-200"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    <span className="text-sm">Choose File or Drop Here</span>
                  </label>
                </div>
              )}
            </div>

            {/* Financial Documents */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Financial Documents
              </label>
              {formData.financialDocuments ? (
                <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-cyan-400/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white text-sm font-medium">
                        {formData.financialDocuments.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatFileSize(formData.financialDocuments.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveFile('financialDocuments')}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    id="financialDocuments"
                    onChange={(e) => onFileUpload(e, 'financialDocuments')}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                  <label
                    htmlFor="financialDocuments"
                    onDrop={(e) => onFileDrop(e, 'financialDocuments')}
                    onDragOver={handleDragOver}
                    className="flex items-center justify-center px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-gray-400 hover:text-white hover:border-cyan-400/40 cursor-pointer transition-all duration-200"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    <span className="text-sm">Choose File or Drop Here</span>
                  </label>
                </div>
              )}
            </div>

            {/* Technical Proposal */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Technical Proposal
              </label>
              {formData.technicalProposal ? (
                <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-cyan-400/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white text-sm font-medium">
                        {formData.technicalProposal.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatFileSize(formData.technicalProposal.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveFile('technicalProposal')}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    id="technicalProposal"
                    onChange={(e) => onFileUpload(e, 'technicalProposal')}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                  <label
                    htmlFor="technicalProposal"
                    onDrop={(e) => onFileDrop(e, 'technicalProposal')}
                    onDragOver={handleDragOver}
                    className="flex items-center justify-center px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-gray-400 hover:text-white hover:border-cyan-400/40 cursor-pointer transition-all duration-200"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    <span className="text-sm">Choose File or Drop Here</span>
                  </label>
                </div>
              )}
            </div>

            {/* Proof of Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Proof of Experience (Reference Letter)
              </label>
              {formData.proofOfExperience ? (
                <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-cyan-400/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white text-sm font-medium">
                        {formData.proofOfExperience.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatFileSize(formData.proofOfExperience.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveFile('proofOfExperience')}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    id="proofOfExperience"
                    onChange={(e) => onFileUpload(e, 'proofOfExperience')}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                  <label
                    htmlFor="proofOfExperience"
                    onDrop={(e) => onFileDrop(e, 'proofOfExperience')}
                    onDragOver={handleDragOver}
                    className="flex items-center justify-center px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-gray-400 hover:text-white hover:border-cyan-400/40 cursor-pointer transition-all duration-200"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    <span className="text-sm">Choose File or Drop Here</span>
                  </label>
                </div>
              )}
            </div>

            {/* Extra/Supporting Documents */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Extra or Supporting Documents
              </label>
              {formData.supportingDocuments ? (
                <div className="flex items-center justify-between p-3 bg-slate-800/50 border border-cyan-400/10 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white text-sm font-medium">
                        {formData.supportingDocuments.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatFileSize(formData.supportingDocuments.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveFile('supportingDocuments')}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    id="supportingDocuments"
                    onChange={(e) => onFileUpload(e, 'supportingDocuments')}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                  <label
                    htmlFor="supportingDocuments"
                    onDrop={(e) => onFileDrop(e, 'supportingDocuments')}
                    onDragOver={handleDragOver}
                    className="flex items-center justify-center px-4 py-3 bg-slate-800/50 border border-cyan-400/20 rounded-lg text-gray-400 hover:text-white hover:border-cyan-400/40 cursor-pointer transition-all duration-200"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    <span className="text-sm">Choose File or Drop Here</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="flex items-center justify-between p-3 border-t border-cyan-400/10 bg-gradient-to-r from-slate-900 to-slate-950">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={onCancel}
          disabled={loading}
          className={`px-3 py-1.5 text-sm bg-slate-800/50 border border-gray-400/20 text-gray-300 rounded-lg transition-all duration-300 ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-800/70"
          }`}
        >
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading}
          className="px-4 py-1.5 text-sm bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
        >
          {loading ? (
            <div className="flex items-center space-x-1.5">
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            "Submit Application"
          )}
        </motion.button>
      </div>
    </form>
  );
};

export default ApplyForm;
