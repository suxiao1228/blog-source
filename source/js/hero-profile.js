(() => {
  const mountPortfolioHome = () => {
    const header = document.querySelector('#page-header.full_page')
    const siteInfo = header?.querySelector('#site-info')
    const main = document.querySelector('main#content-inner')

    if (!header || !siteInfo || !main || document.body.classList.contains('portfolio-home')) return

    document.body.classList.add('portfolio-home')

    siteInfo.innerHTML = `
      <div class="portfolio-hero">
        <div class="portfolio-hero__eyebrow">Hi, I'm</div>
        <h1 class="portfolio-hero__name"><span>SU</span><span>XIAO.</span></h1>
        <h2 class="portfolio-hero__role">专注后端工程、分布式系统与 AI Agent 的开发者</h2>
        <p class="portfolio-hero__intro">
          XUPT 软件工程专业学生，拥有腾讯与美团两段实习经历。关注 Java 后端、
          数据库与系统稳定性，希望把复杂问题拆成清晰、可靠、可持续迭代的工程方案。
        </p>
        <div class="portfolio-hero__actions">
          <a class="portfolio-button portfolio-button--primary" href="#about">了解我 <span>→</span></a>
          <a class="portfolio-button portfolio-button--text" href="#content-inner">阅读博客 <span>↓</span></a>
        </div>
      </div>
    `

    if (!document.querySelector('.portfolio-panels')) {
      const panels = document.createElement('section')
      panels.className = 'portfolio-panels'
      panels.innerHTML = `
        <article class="portfolio-panel portfolio-about" id="about">
          <div class="portfolio-about__avatar">
            <img src="/bloglmage/img/avatar.jpg" alt="苏晓的头像">
          </div>
          <div class="portfolio-about__content">
            <div class="portfolio-section-label">About Me</div>
            <h2>把真实业务问题，做成稳定、清晰的工程系统。</h2>
            <p>
              我是西安邮电大学（XUPT）软件工程专业学生，拥有腾讯与美团两段实习经历。
              主要关注 Java 后端、分布式系统、缓存与数据库等方向，重视接口设计、系统稳定性、
              可维护性与工程交付，也在持续探索 AI Agent 在研发流程中的实际应用。
            </p>
          </div>
        </article>

        <article class="portfolio-panel portfolio-experience" id="experience">
          <div class="portfolio-section-heading">
            <div>
              <div class="portfolio-section-label">Experience & Education</div>
              <h2>经历</h2>
            </div>
            <a href="#content-inner">查看博客 <span>→</span></a>
          </div>

          <div class="portfolio-experience__list">
            <div class="portfolio-experience__item">
              <div class="portfolio-experience__logo portfolio-experience__logo--tencent">T</div>
              <div class="portfolio-experience__body">
                <h3>腾讯</h3>
                <p>后端开发实习，积累大型互联网业务场景下的服务开发与工程协作实践。</p>
              </div>
              <div class="portfolio-experience__meta">Internship</div>
            </div>

            <div class="portfolio-experience__item">
              <div class="portfolio-experience__logo portfolio-experience__logo--meituan">M</div>
              <div class="portfolio-experience__body">
                <h3>美团</h3>
                <p>后端开发实习，参与业务系统迭代，持续提升接口设计、数据处理与稳定性能力。</p>
              </div>
              <div class="portfolio-experience__meta">Internship</div>
            </div>

            <div class="portfolio-experience__item">
              <div class="portfolio-experience__logo portfolio-experience__logo--xupt">X</div>
              <div class="portfolio-experience__body">
                <h3>西安邮电大学 · XUPT</h3>
                <p>软件工程专业，持续学习后端工程、数据库、分布式系统与软件设计。</p>
              </div>
              <div class="portfolio-experience__meta">Education</div>
            </div>
          </div>
        </article>
      `

      main.parentNode.insertBefore(panels, main)
    }
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', mountPortfolioHome)
    : mountPortfolioHome()
})()
