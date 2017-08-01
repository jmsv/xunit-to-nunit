using NUnit.Framework;

[TestFixture]
public class SomeTests
{
    [Test]
    public void Test1()
    {
        string testString = "avocado";

        Assert.IsNotEmpty(testString);
        Assert.AreEqual("avocado", testString);
        Assert.AreNotEqual("potato", testString);
    }
 
    [Test]
    [TestCase(5, 15)]
    [TestCase(6, 18)]
    [TestCase(7, 21)]
    public void Test2(int number1, int number2)
    {
        var result = number2 / number1;
        Assert.AreEqual(3, result);
    }
}
