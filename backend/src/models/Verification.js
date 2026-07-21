class Verification {
  static createRequest(data) {
    return {
      student_name: data.student_name,
      student_email: data.student_email,
      credential_type: data.credential_type,
      title: data.title,
      category: data.category,
      evidence_url: data.evidence_url || '',
      status: data.status || 'pending'
    };
  }

  static createLog(data) {
    return {
      credential_id: data.credential_id,
      verifier_ip: data.verifier_ip,
      verifier_user_agent: data.verifier_user_agent,
      status: data.status
    };
  }
}

module.exports = Verification;
