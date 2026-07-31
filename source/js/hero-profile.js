(() => {
  const mountHeroProfile = () => {
    const siteInfo = document.querySelector('#page-header.full_page #site-info')
    if (!siteInfo || siteInfo.querySelector('.hero-profile')) return

    const profile = document.createElement('div')
    profile.className = 'hero-profile'
    profile.innerHTML = `
      <div class="hero-profile__eyebrow">XUPT · SOFTWARE ENGINEERING</div>
      <div class="hero-profile__summary">腾讯 · 美团两段实习经历，专注后端工程与分布式系统</div>
      <div class="hero-profile__tags" aria-label="个人经历标签">
        <span>Tencent Intern</span>
        <span>Meituan Intern</span>
        <span>Backend Engineering</span>
      </div>
    `

    siteInfo.appendChild(profile)
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', mountHeroProfile)
    : mountHeroProfile()
})()
