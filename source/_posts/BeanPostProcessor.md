---
title: BeanPostProcessor
---

## BeanPostProcessor

  这几天正在复习`Spring`的相关内容，在了解`bean`的生命周期的时候，发现其中涉及到一个特殊的接口——`BeanPostProcessor`接口。由于网上没有找到比较好的博客，所有最后花了好几个小时，通过`Spring`的官方文档对它做了一个大致的了解，下面就来简单介绍一下这个接口。


***2\***|***0\*****二、正文**
***2\***|***1\*****2.1 BeanPostProcessor的功能**

  有时候，我们希望`Spring`容器在创建`bean`的过程中，能够使用我们自己定义的逻辑，对创建的`bean`做一些处理，或者执行一些业务。而实现方式有多种，比如自定义`bean`的初始化话方法等，而`BeanPostProcessor`接口也是用来实现类似的功能的。

  如果我们希望容器中创建的每一个`bean`，在创建的过程中可以执行一些自定义的逻辑，那么我们就可以编写一个类，并让他实现`BeanPostProcessor`接口，然后将这个类注册到一个容器中。容器在创建`bean`的过程中，会优先创建实现了`BeanPostProcessor`接口的`bean`，然后，在创建其他`bean`的时候，会将创建的每一个`bean`作为参数，调用`BeanPostProcessor`的方法。而`BeanPostProcessor`接口的方法，即是由我们自己实现的。下面就来具体介绍一下`BeanPostProcessor`的使用。


***2\***|***2\*****2.2 BeanPostProcessor的使用**

  我们先看一看`BeanPostProcessor`接口的代码：



```java
public interface BeanPostProcessor {
	// 注意这个方法名称关键的是before这个单词
	Object postProcessBeforeInitialization(Object bean, String beanName) 
        throws BeansException;

    // 注意这个方法名称关键的是after这个单词
	Object postProcessAfterInitialization(Object bean, String beanName) 
        throws BeansException;
}
```

  可以看到，`BeanPostProcessor`接口只有两个抽象方法，由实现这个接口的类去实现（后面简称这两个方法为`before`和`after`），这两个方法有着相同的参数：

- **bean**：容器正在创建的那个`bean`的引用；
- **beanName**：容器正在创建的那个`bean`的名称；

  那这两个方法何时执行呢？这就涉及到`Spring`中，`bean`的生命周期了。下面引用`《Spring实战》`中的一张图，这张图表现了`bean`的生命周期，而`Spring`容器创建`bean`的具体过程，请参考这篇博客——[简单谈谈Spring的IoC](https://www.cnblogs.com/tuyang1129/p/12861617.html)。

[![img](https://img2020.cnblogs.com/blog/1324014/202005/1324014-20200511005853157-866375398.png)](https://img2020.cnblogs.com/blog/1324014/202005/1324014-20200511005853157-866375398.png)

  上图中标红的两个地方就是`BeanPostProcessor`中两个方法的执行时机。`Spring`容器在创建`bean`时，如果容器中包含了`BeanPostProcessor`的实现类对象，那么就会执行这个类的这两个方法，并将当前正在创建的`bean`的引用以及名称作为参数传递进方法中。这也就是说，`BeanPostProcessor`的作用域是当前容器中的所有`bean`（不包括一些特殊的`bean`，这个后面说）。

  值得注意的是，我们可以在一个容器中注册多个不同的`BeanPostProcessor`的实现类对象，而`bean`在创建的过程中，将会轮流执行这些对象实现的`before`和`after`方法。那执行顺序如何确定呢？`Spring`提供了一个接口`Ordered`，我们可以让`BeanPostProcessor`的实现类实现这个`Ordered`接口，并实现接口的`getOrder`方法。这个方法的返回值是一个`int`类型，`Spring`容器会通过这个方法的返回值，对容器中的多个`BeanPostProcessor`对象进行从小到大排序，然后在创建`bean`时依次执行它们的方法。也就是说，`getOrder`方法返回值越小的`BeanPostProcessor`对象，它的方法将越先被执行。


***2\***|***3\*****2.3 一个简单的demo**

  下面就来写一个简单的`demo`，来看看`BeanPostProcessor`的效果。首先定义两个普通的`bean`，就叫`User`和`Car`吧：



```java
public class User {

    private String name;
    private int age;
	
    // ... 省略getter和setter...
}

public class Car {
    private int speed;
    private double price;

    // ... 省略getter和setter...
}
```

  在定义一个`BeanPostProcessor`的实现类，重写接口的方法：



```java
public class PostBean implements BeanPostProcessor {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) 
        throws BeansException {
        // 输出信息，方便我们看效果
        System.out.println("before -- " + beanName);
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) 
        throws BeansException {
        // 输出信息，方便我们看效果
        System.out.println("after -- " + beanName);
        return bean;
    }

}
```

  我们直接使用一个`Java`类作为`Spring`的配置，就不使用`xml`配置文件了。配置如下，在这个配置类中，声明了`User`、`Car`以及`PostBean`这三个`bean`的工厂方法，前两个是普通`bean`，而`PostBean`是实现`BeanPostProcessor`的`bean`：



```java
@Configuration
public class BeanConfig {
	// 在Spring中注册User这个bean
    @Bean
    public User user() {
        return new User();
    }
    
    // 在Spring中注册Car这个bean
    @Bean
    public Car car() {
        return new Car();
    }

    // 在Spring中注册PostBean这个bean，这个bean实现了BeanPostProcessor接口
    @Bean
    public PostBean postBean() {
        return new PostBean();
    }

}
```

  好，有了上面四个类，就可以开始测试了，下面是测试方法：



```java
@Test
public void testConfig() {
    ApplicationContext context =
        new AnnotationConfigApplicationContext(BeanConfig.class);
}
```

  上面这个方法啥也不干，就是创建一个`Spring`的上下文对象，也就是`Spring`的`IoC`容器。这个容器将去加载`BeanConfig`这个类的配置，然后创建配置类中声明的对象。在创建User和Car的过程中，就会执行`BeanPostProcessor`实现类的方法。我们看看执行结果：



```java
before -- org.springframework.context.event.internalEventListenerProcessor
after -- org.springframework.context.event.internalEventListenerProcessor
before -- org.springframework.context.event.internalEventListenerFactory
after -- org.springframework.context.event.internalEventListenerFactory
before -- car
after -- car
before -- user
after -- user
```

  可以看到，`BeanPostProcessor`的`before`方法和`after`方法都被调用了四次，最后两次调用时，传入的参数正是我们自己定义的`Bean`——`User`和`Car`。那为什么调用了四次呢，明明我们只定义了两个普通`bean`。我们看上面的输出发现，前两次调用，传入的`bean`是`Spring`内部的组件。`Spring`在初始化容器的过程中，会创建一些自己定义的`bean`用来实现一些功能，而这些`bean`，也会执行我们注册进容器中的`BeanPostProcessor`实现类的方法。


***2\***|***4\*****2.4 使用BeanPostProcessor时容易踩的坑**

  `BeanPostProcessor`这个接口，在使用的过程中，其实还有许多的限制和坑点，若不了解的话，可能会让你对某些结果感到莫名其妙。下面我就来简单地说一说：

**（一）BeanPostProcessor依赖的bean，不会执行BeanPostProcessor的方法**

  当我们在`BeanPostProcessor`的实现类中，依赖了其他的`bean`，那么被依赖的`bean`被创建时，将不会执行它所在的`BeanPostProcessor`实现类实现的方法，比如我们修改`PostBean`的实现，如下所示：



```java
@Component
public class PostBean implements BeanPostProcessor, Ordered {
    // 让PostBean依赖User
    @Autowired
    private User user;

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) 
        throws BeansException {
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) 
        throws BeansException {
        return bean;
    }
}
```

  此时，容器在创建`User`这个`bean`时，不会执行`PostBean`实现的两个方法，因为由于`PostBean`依赖于`user`，所以`user`需要在`PostBean`之前创建完成，这也就意味着在`user`创建时，`PostBean`还未初始化完成，所以不会调用它的方法。



**（二）BeanPostProcessor以及依赖的bean无法使用AOP**

  以下是`Spring`官方文档中的一段话：

> Because AOP auto-proxying is implemented as a `BeanPostProcessor` itself, neither `BeanPostProcessor` s nor the beans they reference directly are eligible for auto-proxying, and thus do not have aspects woven into them.

  上面这段话的意思大致是说，`Spring`的`AOP`代理就是作为`BeanPostProcessor`实现的，所以**我们无法对BeanPostProcessor的实现类使用AOP织入通知，也无法对BeanPostProcessor的实现类依赖的bean使用AOP织入通知**。`Spring`的`AOP`实现我暂时还没有研究过，所以上面的说`AOP`作为`BeanPostProcessor`实现的意思我不是特别明白，但是我们现在只需要关注`BeanPostProcessor`以及它依赖的`bean`都无法使用`AOP`这一点。为了验证上面的说法，我稍微修改一下`2.3`中的例子，来测试一波。

  首先，我们修改`2.3`中用到的`PostBean`和`User`这两个类，让`PostBean`依赖`User`这个类，同时为了输出更加地简单，我们将`before`和`after`方法中的`println`语句删了：



```java
@Component
public class PostBean implements BeanPostProcessor, Ordered {
    // 让PostBean依赖User
    @Autowired
    private User user;

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) 
        throws BeansException {
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) 
        throws BeansException {
        return bean;
    }

    // 此方法用来测试AOP，作为切点
    public void testAOP() {
        System.out.println("Post Bean");
    }
}

@Component
public class User {

    private String name;
    private int age;
	
    // ... 省略getter和setter...
    
    // 此方法用来测试AOP，用作切点
    public void testAOP() {
        System.out.println("user bean");
    }
}
```

  然后，我们定义一个`AOP`的切面，在切面中将`PostBean`的`testAOP`方法作为切点，代码如下：



```java
@Aspect
public class BeanPostProcessorAspect {
    
	// 此方法织入PostBean的testAOP方法
    @Before("execution(* cn.tewuyiang.pojo.PostBean.testAOP(..))")
    public void before() {
        System.out.println("before1");
    }

    // 此方法织入User的testAOP方法
    @Before("execution(* cn.tewuyiang.pojo.User.testAOP(..))")
    public void before2() {
        System.out.println("before2");
    }
}
```

  好，这就准备完毕，可以开始测试了。我们这次使用`Spring`注解扫描来配置`bean`以及为`bean`注入依赖，测试代码如下：



```java
@Test
public void testConfig() {
    ApplicationContext context =
        new AnnotationConfigApplicationContext(AutoConfig.class);
    // 获取User这个bean，执行测试AOP的方法
    User user = context.getBean(User.class);
    user.testAOP();
    // 获取PostBean这个bean，执行测试AOP的方法
    PostBean bean = context.getBean(PostBean.class);
    bean.testAOP();
}

输出如下：
	user bean
	post Bean
```

  从输出中可以看到，使用`AOP`织入的前置通知没有执行，这也就验证了上面所说的，`BeanPostProcessor`的实现类以及实现类依赖的`bean`，无法使用`AOP`为其织入通知。但是这个限制具体有到什么程度，我也不是很确定，因为我使用`xml`配置依赖，以及上面使用注解扫描两种方式，`AOP`织入都没法使用，但是我在使用`@Bean`这种配置方式时，被依赖的`bean`却成功执行了通知。所以，关于此处提到的限制，还需要深入了解`Spring`容器的源码实现才能下定论。



**（三）注册BeanPostProcessor的方式以及限制**

  我们如何将`BeanPostProcessor`注册到`Spring`容器中？方式主要有两种，第一种就是上面一直在用的，将其声明在`Spring`的配置类或`xml`文件中，作为普通的`bean`，让`ApplicationContext`对象去加载它，这样它就被自动注册到容器中了。而且`Spring`容器会对`BeanPostProcessor`的实现类做特殊处理，即会将它们挑选出来，在加载其他`bean`前，优先加载`BeanPostProcessor`的实现类。

  还有另外一种方式就是使用`ConfigurableBeanFactory`接口的`addBeanPostProcessor`方法手动添加，`ApplicationContext`对象中组合了一个`ConfigurableBeanFactory`的实现类对象。但是这种方式添加`BeanPostProcessor`有一些缺点。首先，我们一创建`Spring`容器，在配置文件中配置的单例`bean`就会被加载，此时`addBeanPostProcessor`方法还没有执行，那我们手动添加的`BeanPostProcessor`也就无法作用于这些`bean`了，所以手动添加的`BeanPostProcessor`只能作用于那些延迟加载的`bean`，或者非单例`bean`。

  还有一个就是，**使用addBeanPostProcessor方式添加的BeanPostProcessor，Ordered接口的作用将失效，而是以注册的顺序执行**。我们前面提过，`Ordered`接口用来指定多个`BeanPostProcessor`实现的方法的执行顺序。这是`Spring`官方文档中提到的：

> While the recommended approach for `BeanPostProcessor` registration is through `ApplicationContext` auto-detection (as described above), it is also possible to register them programmatically against a `ConfigurableBeanFactory` using the `addBeanPostProcessor` method. This can be useful when needing to evaluate conditional logic before registration, or even for copying bean post processors across contexts in a hierarchy. Note however that `BeanPostProcessor` s added programmatically do not respect the `Ordered` interface. Here it is the order of registration that dictates the order of execution. Note also that `BeanPostProcessor` s registered programmatically are always processed before those registered through auto-detection, regardless of any explicit ordering.



**（四）使用@Bean配置BeanPostProcessor的限制**

  如果我们使用`Java`类的方式配置`Spring`，并使用`@Bean`声明一个工厂方法返回`bean`实例，那么返回值的类型必须是`BeanPostProcessor`类型，或者等级低于`BeanPostProcessor`的类型。这里不好口头描述，直接看代码吧。以下是一个`BeanPostProcessor`的实现类，它实现了多个接口：



```java
/**
 * 此BeanPostProcessor的实现类，还实现了Ordered接口
 */
public class PostBean implements BeanPostProcessor, Ordered {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) 
        throws BeansException {
        System.out.println("before -- " + beanName);
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) 
        throws BeansException {
        System.out.println("after -- " + beanName);
        return bean;
    }

    @Override
    public int getOrder() {
        return 0;
    }
}
```

  我们在配置类中，声明`PostBean`可以有以下几种方式：



```java
@Configuration
public class BeanConfig {

	// 方式1：PostBean
    @Bean
    public PostBean postBean() {
        return new PostBean();
    }
    
    // 方式2：返回值为BeanPostProcessor
    @Bean
    public BeanPostProcessor postBean() {
        return new PostBean();
    }
    
    // 方式3：返回值为Ordered
    @Bean
    public Ordered postBean() {
        return new PostBean();
    }
}
```

  以上三种方式都可以让`Spring`容器创建`PostBean`实例对象，因为`PostBean`实现了`BeanPostProcessor`和`Ordered`接口，所以它的对象也是这两种类型的对象。但是需要注意，上面三种方式中，只有第一种和第二种方式，会让`Spring`容器将`PostBean`当作`BeanPostProcessor`处理；而第三种方式，则会被当作一个普通`Bean`处理，实现`BeanPostProcessor`的两个方法都不会被调用。因为在`PostBean`的继承体系中，`Ordered`和`BeanPostProcessor`是同级别的，`Spring`无法识别出这个`Ordered`对象，也是一个`BeanPostProcessor`对象；但是使用`PostBean`却可以，因为`PostBean`类型就是`BeanPostProcessor`的子类型。**所以，在使用@Bean声明工厂方法返回BeanPostProcessor实现类对象时，返回值必须是BeanPostProcessor类型，或者更低级的类型**。`Spring`官方文档中，这一部分的内容如下：

> Note that when declaring a `BeanPostProcessor` using an `@Bean` factory method on a configuration class, the return type of the factory method should be the implementation class itself or at least the `org.springframework.beans.factory.config.BeanPostProcessor` interface, clearly indicating the post-processor nature of that bean. Otherwise, the `ApplicationContext` won’t be able to autodetect it by type before fully creating it. Since a `BeanPostProcessor` needs to be instantiated early in order to apply to the initialization of other beans in the context, this early type detection is critical.


***3\***|***0\*****三、总结**

  以上就对`BeanPostProcessor`的功能、使用以及需要注意的问题做了一个大致的介绍。需要注意的是，上面所提到的问题，可能根据不同的情况，会有不同的结果，因为文档中的资料只是简单地提了几句，并不详细，上面的内容大部分都是我基于官方文档的描述，以及自己的测试得出，所以可能并不准确。还需要自己在实践中去尝试，或者阅读源码，才能彻底了解`BeanPostProcessor`的执行机制。

